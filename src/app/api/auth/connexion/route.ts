export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash)
      return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 })

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid)
      return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
