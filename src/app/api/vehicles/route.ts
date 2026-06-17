export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { userId } = verifyToken(token)
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(vehicles)
  } catch (e) {
    console.error('Error fetching vehicles:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { userId } = verifyToken(token)
    const body = await req.json()
    const { matricule, marque, modele, type, couleur, infos } = body

    if (!matricule || !marque || !type) {
      return NextResponse.json({ message: 'Données manquantes (matricule, marque, type requis)' }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        matricule,
        marque,
        modele: modele || null,
        type,
        couleur: couleur || null,
        infos: infos || null
      }
    })

    return NextResponse.json(vehicle)
  } catch (e) {
    console.error('Error creating vehicle:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { userId } = verifyToken(token)
    const body = await req.json()
    const { id, matricule, marque, modele, type, couleur, infos } = body

    if (!id) return NextResponse.json({ message: 'ID manquant' }, { status: 400 })

    const existing = await prisma.vehicle.findUnique({ where: { id: Number(id) } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ message: 'Véhicule introuvable' }, { status: 404 })
    }

    const updated = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: {
        matricule: matricule !== undefined ? matricule : undefined,
        marque: marque !== undefined ? marque : undefined,
        modele: modele !== undefined ? modele : undefined,
        type: type !== undefined ? type : undefined,
        couleur: couleur !== undefined ? couleur : undefined,
        infos: infos !== undefined ? infos : undefined
      }
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('Error updating vehicle:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { userId } = verifyToken(token)
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || (await req.json().then(b => b.id).catch(() => null))

    if (!id) return NextResponse.json({ message: 'ID manquant' }, { status: 400 })

    const existing = await prisma.vehicle.findUnique({ where: { id: Number(id) } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ message: 'Véhicule introuvable' }, { status: 404 })
    }

    const deleted = await prisma.vehicle.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json(deleted)
  } catch (e) {
    console.error('Error deleting vehicle:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
