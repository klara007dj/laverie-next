export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const POSTES: Record<string, string> = {
  'martin.d@gmail.com': 'Transporteur indépendant',
  'sophie.l@gmail.com': 'Responsable flotte, TransLog',
  'ahmed.k@gmail.com': 'Chauffeur longue distance',
}

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = reviews.map((r) => {
      const email = r.user.email
      const poste = POSTES[email] || 'Client LaveriePro'
      const nomComplet = `${r.user.prenom} ${r.user.nom.charAt(0)}.`
      return {
        id: r.id,
        nom: nomComplet,
        poste,
        texte: r.comment,
        rating: r.rating,
        createdAt: r.createdAt,
      }
    })

    return NextResponse.json(formatted)
  } catch (e) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    const { userId } = verifyToken(token)

    const { washId, rating, comment } = await req.json()

    if (!washId || !rating || !comment) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Note invalide (doit être entre 1 et 5)' }, { status: 400 })
    }

    const wash = await prisma.wash.findUnique({
      where: { id: Number(washId) },
    })

    if (!wash) {
      return NextResponse.json({ message: 'Lavage introuvable' }, { status: 404 })
    }

    if (wash.userId !== userId) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    if (wash.statut !== 'COMPLETED') {
      return NextResponse.json({ message: 'Vous ne pouvez laisser un avis que pour un lavage terminé.' }, { status: 400 })
    }

    // Check if review already exists
    const existing = await prisma.review.findUnique({
      where: { washId: Number(washId) },
    })
    if (existing) {
      return NextResponse.json({ message: 'Vous avez déjà laissé un avis pour ce lavage.' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        userId,
        washId: Number(washId),
        rating: Number(rating),
        comment,
      },
    })

    return NextResponse.json(review)
  } catch (e) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

    const url = new URL(req.url)
    const id = url.searchParams.get('id') || (await req.json().then(b => b.id).catch(() => null))
    if (!id) return NextResponse.json({ message: 'ID manquant' }, { status: 400 })

    const deleted = await prisma.review.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json(deleted)
  } catch (e) {
    console.error('Error deleting review:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
