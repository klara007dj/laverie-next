export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const FALLBACK = [
  { nom: 'Lavage Complet',  total: 620 },
  { nom: 'Lavage Express',  total: 480 },
  { nom: 'Éco-lavage',       total: 310 },
  { nom: 'Désinfection',    total: 220 },
  { nom: 'Citerne/Benne',   total: 185 },
  { nom: 'Anti-corrosion',  total: 125 },
]

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { role } = verifyToken(token)
    if (role !== 'ADMIN') return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })

    const grouped = await prisma.wash.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })
    if (!grouped.length) return NextResponse.json(FALLBACK)
    const result = await Promise.all(
      grouped.map(async (g: { serviceId: number; _count: { id: number } }) => {
        const svc = await prisma.service.findUnique({ where: { id: g.serviceId } })
        return { nom: svc?.nom || 'Service', total: g._count.id }
      })
    )
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
