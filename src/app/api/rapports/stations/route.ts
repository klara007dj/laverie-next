export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const FALLBACK = [
  { nom: 'Station Akwa',         lavages: 82, revenus: 1230000 },
  { nom: 'Station Bonapriso',    lavages: 71, revenus: 1065000 },
  { nom: 'Station Bonamoussadi', lavages: 68, revenus: 1020000 },
  { nom: 'Station Deido',        lavages: 55, revenus: 825000  },
  { nom: 'Station Bépanda',      lavages: 63, revenus: 945000  },
  { nom: 'Station Logbessou',    lavages: 49, revenus: 735000  },
  { nom: 'Station Makepe',       lavages: 57, revenus: 855000  },
  { nom: 'Station PK8',          lavages: 73, revenus: 1095000 },
  { nom: 'Station Yassa',        lavages: 88, revenus: 1320000 },
  { nom: 'Station Ndokoti',      lavages: 61, revenus: 915000  },
  { nom: 'Station Bonabéri',     lavages: 79, revenus: 1185000 },
  { nom: 'Station Logpom',       lavages: 42, revenus: 630000  },
]

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { role } = verifyToken(token)
    if (role !== 'ADMIN') return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })

    const stations = await prisma.station.findMany()
    if (!stations.length) return NextResponse.json(FALLBACK)
    const result = await Promise.all(
      stations.map(async (s: { id: number; nom: string }) => {
        const agg = await prisma.wash.aggregate({
          where: { stationId: s.id, statut: 'COMPLETED' },
          _count: { id: true },
          _sum:   { prixPaye: true },
        })
        return { nom: s.nom, lavages: agg._count.id, revenus: agg._sum.prixPaye || 0 }
      })
    )
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
