import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { role } = verifyToken(token)
    if (role !== 'ADMIN') return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
  return NextResponse.json([
    { id: 1, mois: 'Janvier',  annee: 2025, total: 142, revenus: 2840000 },
    { id: 2, mois: 'Février',  annee: 2025, total: 158, revenus: 3160000 },
    { id: 3, mois: 'Mars',     annee: 2025, total: 175, revenus: 3500000 },
    { id: 4, mois: 'Avril',    annee: 2025, total: 163, revenus: 3260000 },
    { id: 5, mois: 'Mai',      annee: 2025, total: 190, revenus: 3800000 },
    { id: 6, mois: 'Juin',     annee: 2025, total: 201, revenus: 4020000 },
  ])
  } catch {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
