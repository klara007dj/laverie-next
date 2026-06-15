export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    let isAdmin = false
    if (token) {
      try {
        const payload = verifyToken(token)
        if (payload.role === 'ADMIN') isAdmin = true
      } catch {}
    }

    const services = await prisma.service.findMany({
      where: isAdmin ? undefined : { active: true },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(services)
  } catch (e) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    const data = await req.json()
    const { nom, description, prixFcfa, durationMinutes, icon, active } = data

    if (!nom || !description || !prixFcfa) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        nom,
        description,
        prixFcfa: Number(prixFcfa),
        durationMinutes: Number(durationMinutes || 30),
        icon: icon || 'Droplets',
        active: active !== undefined ? Boolean(active) : true
      }
    })

    return NextResponse.json(service)
  } catch (e) {
    console.error('Error creating service:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
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

    const data = await req.json()
    const { id, nom, description, prixFcfa, durationMinutes, icon, active } = data

    if (!id) return NextResponse.json({ message: 'ID manquant' }, { status: 400 })

    const updated = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        nom,
        description,
        prixFcfa: prixFcfa !== undefined ? Number(prixFcfa) : undefined,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        icon,
        active: active !== undefined ? Boolean(active) : undefined
      }
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('Error updating service:', e)
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

    // Delete associated washes first
    await prisma.wash.deleteMany({ where: { serviceId: Number(id) } })

    const deleted = await prisma.service.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json(deleted)
  } catch (e) {
    console.error('Error deleting service:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
