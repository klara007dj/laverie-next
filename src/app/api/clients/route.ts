export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
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

    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (e) {
    console.error('Error fetching clients:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
