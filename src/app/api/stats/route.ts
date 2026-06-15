export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalWashes, totalClients, stationsActives, totalServices] = await Promise.all([
      prisma.wash.count({ where: { statut: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.station.count(),
      prisma.service.count({ where: { active: true } }),
    ])

    const totalReviews = await prisma.review.count()
    let tauxSatisfaction = 0
    if (totalReviews > 0) {
      const positiveReviews = await prisma.review.count({
        where: { rating: { gte: 4 } },
      })
      tauxSatisfaction = Math.round((positiveReviews / totalReviews) * 100)
    }

    const anneesExperience = 1

    return NextResponse.json({
      totalLavages: totalWashes,
      totalClients,
      stationsActives,
      totalServices,
      tauxSatisfaction,
      anneesExperience,
    })
  } catch (e) {
    console.error('Error in GET /api/stats:', e)
    return NextResponse.json({
      totalLavages: 0,
      totalClients: 0,
      stationsActives: 0,
      totalServices: 0,
      tauxSatisfaction: 0,
      anneesExperience: 1,
    })
  }
}
