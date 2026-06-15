export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateVoucherIfEligible } from '@/lib/loyalty'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { userId } = verifyToken(token)
    const washes = await prisma.wash.findMany({
      where: { userId },
      include: { service: true, station: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(washes)
  } catch { return NextResponse.json({ message: 'Erreur' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { userId } = verifyToken(token)
    const { serviceId, stationId } = await req.json()

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) return NextResponse.json({ message: 'Service introuvable' }, { status: 404 })

    const station = await prisma.station.findUnique({ where: { id: stationId } })
    if (!station) return NextResponse.json({ message: 'Station introuvable' }, { status: 404 })

    if (station.statut !== 'ACTIVE') {
      return NextResponse.json({ message: 'Cette station est indisponible (en maintenance ou fermée).' }, { status: 400 })
    }

    if (station.placesLibres <= 0) {
      return NextResponse.json({ message: 'Cette station est complète pour le moment.' }, { status: 400 })
    }

    const wash = await prisma.wash.create({
      data: { userId, serviceId, stationId, prixPaye: service.prixFcfa, statut: 'PENDING' },
      include: { service: true, station: true },
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

    const { id, statut } = await req.json()
    if (!id || !statut) return NextResponse.json({ message: 'Données manquantes' }, { status: 400 })

    const wash = await prisma.wash.findUnique({ where: { id: Number(id) } })
    if (!wash) return NextResponse.json({ message: 'Lavage introuvable' }, { status: 404 })

    const oldStatut = wash.statut
    const newStatut = statut

    if (oldStatut === 'COMPLETED' || oldStatut === 'CANCELLED') {
      return NextResponse.json({ message: 'Cette prestation est déjà close.' }, { status: 400 })
    }

    // 1. Transition to IN_PROGRESS (validation by admin): check and decrement placesLibres
    if (newStatut === 'IN_PROGRESS' && oldStatut !== 'IN_PROGRESS') {
      const station = await prisma.station.findUnique({ where: { id: wash.stationId } })
      if (!station) {
        return NextResponse.json({ message: 'Station introuvable' }, { status: 404 })
      }
      if (station.statut !== 'ACTIVE') {
        return NextResponse.json({ message: 'Cette station est indisponible.' }, { status: 400 })
      }
      if (station.placesLibres <= 0) {
        return NextResponse.json({ message: 'Cette station est complète pour le moment.' }, { status: 400 })
      }

      await prisma.station.update({
        where: { id: wash.stationId },
        data: { placesLibres: { decrement: 1 } }
      })
    }

    // 2. Transition from IN_PROGRESS to COMPLETED/CANCELLED: increment placesLibres back
    if (oldStatut === 'IN_PROGRESS' && (newStatut === 'COMPLETED' || newStatut === 'CANCELLED')) {
      await prisma.station.update({
        where: { id: wash.stationId },
        data: { placesLibres: { increment: 1 } }
      })
    }

    // 3. Transition to COMPLETED: award loyalty points and generate voucher
    if (newStatut === 'COMPLETED' && oldStatut !== 'COMPLETED') {
      const updatedUser = await prisma.user.update({
        where: { id: wash.userId },
        data: {
          totalWashes: { increment: 1 },
          loyaltyPoints: { increment: 1 }
        }
      })
      await generateVoucherIfEligible(wash.userId, updatedUser.totalWashes)
    }

    // Update status in db
    const updatedWash = await prisma.wash.update({
      where: { id: Number(id) },
      data: { statut: newStatut },
      include: { service: true, station: true }
    })

    return NextResponse.json(updatedWash)
  } catch (e) {
    console.error('Error updating wash:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
