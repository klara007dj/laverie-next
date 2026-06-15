export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, password, telephone } = await req.json()

    if (!nom || !prenom || !email || !password)
      return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json({ message: 'Cet e-mail est déjà utilisé' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { nom, prenom, email, passwordHash, telephone: telephone || null },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      message: 'Compte créé avec succès',
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
