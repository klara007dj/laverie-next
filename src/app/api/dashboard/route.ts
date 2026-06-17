/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getLoyaltyProgress } from '@/lib/loyalty'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    
    let userId: number
    let role: string
    try {
      const payload = verifyToken(token)
      userId = payload.userId
      role = payload.role
    } catch {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    if (role === 'ADMIN') {
      const [user, washes, clients, stations, services, stats, transactions] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.wash.findMany({ include: { service: true, station: true, user: true, vehicle: true }, orderBy: { createdAt: 'desc' } }),
        prisma.user.findMany({ where: { role: 'CLIENT' }, orderBy: { createdAt: 'desc' } }),
        prisma.station.findMany({ orderBy: { nom: 'asc' } }),
        prisma.service.findMany({ orderBy: { id: 'asc' } }),
        prisma.wash.aggregate({ _sum: { prixPaye: true }, where: { statut: 'COMPLETED' } }),
        prisma.walletTransaction.findMany({
          where: {
            OR: [
              { type: 'PAIEMENT' },
              { type: 'RECHARGE', moyenPaiement: 'REMBOURSEMENT' }
            ]
          },
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        })
      ])

      if (!user) return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })

      const totalWashes   = washes.filter((w: any) => w.statut === 'COMPLETED').length
      const totalReservations = washes.length
      const totalRevenus = stats._sum.prixPaye || 0

      return NextResponse.json({
        user,
        washes,
        clients,
        stations,
        services,
        totalWashes,
        totalReservations,
        totalRevenus,
        transactions
      })
    }

    // Client Dashboard payload
    const [user, washes, vouchers, vehicles, transactions, dbWallet] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.wash.findMany({ where: { userId }, include: { service: true, station: true, review: true, vehicle: true }, orderBy: { createdAt: 'desc' } }),
      prisma.voucher.findMany({ where: { userId, used: false, expiresAt: { gte: new Date() } } }),
      prisma.vehicle.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.walletTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.wallet.findUnique({ where: { userId } })
    ])

    if (!user) return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 })

    // Auto create wallet if client doesn't have one
    let wallet = dbWallet
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId, solde: 0 } })
    }

    const totalWashes   = await prisma.wash.count({ where: { userId, statut: 'COMPLETED' } })
    const totalReservations = await prisma.wash.count({ where: { userId } })
    const loyalty = getLoyaltyProgress(user.totalWashes)

    return NextResponse.json({
      user,
      washes,
      vouchers,
      vehicles,
      transactions,
      wallet,
      totalWashes,
      totalReservations,
      loyalty
    })
  } catch (e) {
    console.error("Error in GET /api/dashboard:", e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
