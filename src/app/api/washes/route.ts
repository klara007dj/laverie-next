/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateVoucherIfEligible } from '@/lib/loyalty'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    
    const { userId, role } = verifyToken(token)

    let washes
    if (role === 'ADMIN') {
      washes = await prisma.wash.findMany({
        include: { service: true, station: true, user: true, vehicle: true },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      washes = await prisma.wash.findMany({
        where: { userId },
        include: { service: true, station: true, vehicle: true, user: true },
        orderBy: { createdAt: 'desc' }
      })
    }
    
    return NextResponse.json(washes)
  } catch (e) {
    console.error('Error fetching washes:', e)
    return NextResponse.json({ message: 'Erreur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { userId } = verifyToken(token)
    const { serviceId, stationId, vehicleId, startTime } = await req.json()

    if (!serviceId || !stationId || !vehicleId) {
      return NextResponse.json({ message: 'Données manquantes (serviceId, stationId, vehicleId requis)' }, { status: 400 })
    }

    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } })
    if (!service) return NextResponse.json({ message: 'Service introuvable' }, { status: 404 })

    const station = await prisma.station.findUnique({ where: { id: Number(stationId) } })
    if (!station) return NextResponse.json({ message: 'Station introuvable' }, { status: 404 })

    if (station.statut !== 'ACTIVE') {
      return NextResponse.json({ message: 'Cette station est indisponible (en maintenance ou fermée).' }, { status: 400 })
    }

    if (station.placesLibres <= 0) {
      return NextResponse.json({ message: 'Cette station est complète pour le moment.' }, { status: 400 })
    }

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } })
    if (!vehicle || vehicle.userId !== userId) {
      return NextResponse.json({ message: 'Véhicule introuvable ou invalide.' }, { status: 404 })
    }

    // Check Wallet Balance
    let wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId, solde: 0 } })
    }

    if (wallet.solde < service.prixFcfa) {
      return NextResponse.json({
        message: 'Solde insuffisant. Veuillez recharger votre Wallet avant de poursuivre.'
      }, { status: 400 })
    }

    // Create reservation with status PENDING_VALIDATION
    const wash = await prisma.wash.create({
      data: {
        userId,
        serviceId: Number(serviceId),
        stationId: Number(stationId),
        vehicleId: Number(vehicleId),
        prixPaye: service.prixFcfa,
        statut: 'PENDING_VALIDATION',
        startTime: startTime ? new Date(startTime) : null
      },
      include: { service: true, station: true, vehicle: true, user: true }
    })

    return NextResponse.json({ wash })
  } catch (e) {
    console.error('Error in POST /api/washes:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    
    let role: string
    try {
      const payload = verifyToken(token)
      role = payload.role
    } catch {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    if (role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { id, statut, stationId } = await req.json()
    if (!id || !statut) return NextResponse.json({ message: 'Données manquantes' }, { status: 400 })

    const wash = await prisma.wash.findUnique({
      where: { id: Number(id) },
      include: { service: true }
    })
    if (!wash) return NextResponse.json({ message: 'Lavage introuvable' }, { status: 404 })

    const oldStatut = wash.statut
    const newStatut = statut
    const oldStationId = wash.stationId
    const newStationId = stationId !== undefined ? Number(stationId) : oldStationId
    const stationChanged = newStationId !== oldStationId

    if (oldStatut === 'COMPLETED' || oldStatut === 'REJECTED') {
      return NextResponse.json({ message: 'Cette prestation est déjà close.' }, { status: 400 })
    }

    // We implement the 7-step transitions
    
    // 1. Transition to ACCEPTED (debit wallet, decrement placesLibres)
    if (newStatut === 'ACCEPTED') {
      if (oldStatut !== 'PENDING_VALIDATION') {
        return NextResponse.json({ message: 'Transition invalide.' }, { status: 400 })
      }

      // Check target station availability
      const targetStation = await prisma.station.findUnique({ where: { id: newStationId } })
      if (!targetStation || targetStation.statut !== 'ACTIVE') {
        return NextResponse.json({ message: 'Station cible introuvable ou inactive.' }, { status: 400 })
      }
      if (targetStation.placesLibres <= 0) {
        return NextResponse.json({ message: 'Cette station est complète pour le moment.' }, { status: 400 })
      }

      // Verify wallet balance again
      const wallet = await prisma.wallet.findUnique({ where: { userId: wash.userId } })
      if (!wallet || wallet.solde < wash.prixPaye) {
        return NextResponse.json({ message: 'Le client ne dispose plus d\'un solde suffisant sur son Wallet.' }, { status: 400 })
      }

      // Perform atomic database operations: debit wallet, log transaction, update wash, decrement station
      try {
        await prisma.$transaction(async (tx: any) => {
          // 1. Debit Wallet
          await tx.wallet.update({
            where: { userId: wash.userId },
            data: { solde: { decrement: wash.prixPaye } }
          })
          
          // 2. Create Payment Transaction
          await tx.walletTransaction.create({
            data: {
              userId: wash.userId,
              montant: -wash.prixPaye, // represented as negative for debit
              type: 'PAIEMENT',
              moyenPaiement: 'WALLET',
              statut: 'REUSSIE'
            }
          })

          // 3. Decrement placesLibres
          const updateResult = await tx.station.updateMany({
            where: { id: newStationId, placesLibres: { gt: 0 } },
            data: { placesLibres: { decrement: 1 } }
          })
          if (updateResult.count === 0) {
            throw new Error('STATION_FULL')
          }
        })
      } catch (err: any) {
        if (err.message === 'STATION_FULL') {
          return NextResponse.json({ message: 'La station a été remplie entre temps.' }, { status: 400 })
        }
        throw err
      }
    }

    // 2. Transition from PENDING_VALIDATION to REJECTED (no debit)
    if (newStatut === 'REJECTED' && oldStatut === 'PENDING_VALIDATION') {
      // Nothing special to debit or release, just transition status
    }

    // 3. Transition from ACCEPTED / VEHICLE_DEPOSITED / WASHING / READY to REJECTED/CANCELLED (release station spot)
    if ((newStatut === 'REJECTED' || newStatut === 'CANCELLED') && oldStatut !== 'PENDING_VALIDATION') {
      // Increment placesLibres of old station back
      await prisma.station.update({
        where: { id: oldStationId },
        data: { placesLibres: { increment: 1 } }
      })
      
      // OPTIONAL: Refund client wallet since admin cancels an accepted reservation?
      // Yes, if admin cancels/rejects after acceptance, refund their wallet to be fair.
      if (['ACCEPTED', 'VEHICLE_DEPOSITED', 'WASHING', 'READY'].includes(oldStatut)) {
        await prisma.$transaction(async (tx: any) => {
          await tx.wallet.update({
            where: { userId: wash.userId },
            data: { solde: { increment: wash.prixPaye } }
          })
          await tx.walletTransaction.create({
            data: {
              userId: wash.userId,
              montant: wash.prixPaye, // positive for refund credit
              type: 'RECHARGE',
              moyenPaiement: 'REMBOURSEMENT',
              statut: 'REUSSIE'
            }
          })
        })
      }
    }

    // 4. Reassignment: if wash was ACCEPTED/IN_PROGRESS and admin changes stationId
    if (stationChanged && ['ACCEPTED', 'VEHICLE_DEPOSITED', 'WASHING', 'READY'].includes(oldStatut)) {
      const targetStation = await prisma.station.findUnique({ where: { id: newStationId } })
      if (!targetStation || targetStation.statut !== 'ACTIVE') {
        return NextResponse.json({ message: 'Station cible introuvable ou inactive.' }, { status: 400 })
      }

      try {
        await prisma.$transaction(async (tx: any) => {
          const updateResult = await tx.station.updateMany({
            where: { id: newStationId, placesLibres: { gt: 0 } },
            data: { placesLibres: { decrement: 1 } }
          })
          if (updateResult.count === 0) {
            throw new Error('STATION_FULL')
          }
          await tx.station.update({
            where: { id: oldStationId },
            data: { placesLibres: { increment: 1 } }
          })
        })
      } catch (err: any) {
        if (err.message === 'STATION_FULL') {
          return NextResponse.json({ message: 'Cette station est complète pour le moment.' }, { status: 400 })
        }
        throw err
      }
    }

    // 5. Transition to COMPLETED (release station spot, award loyalty points)
    if (newStatut === 'COMPLETED' && oldStatut !== 'COMPLETED') {
      // Release station spot
      await prisma.station.update({
        where: { id: oldStationId },
        data: { placesLibres: { increment: 1 } }
      })

      // Award loyalty points
      const updatedUser = await prisma.user.update({
        where: { id: wash.userId },
        data: {
          totalWashes: { increment: 1 },
          loyaltyPoints: { increment: 1 }
        }
      })
      await generateVoucherIfEligible(wash.userId, updatedUser.totalWashes)
    }

    // Update wash in DB
    const updatedWash = await prisma.wash.update({
      where: { id: Number(id) },
      data: {
        statut: newStatut,
        stationId: newStationId,
        endTime: newStatut === 'COMPLETED' ? new Date() : undefined,
        startedAt: newStatut === 'WASHING' ? new Date() : undefined
      },
      include: { service: true, station: true, vehicle: true, user: true }
    })

    return NextResponse.json(updatedWash)
  } catch (e) {
    console.error('Error updating wash:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
