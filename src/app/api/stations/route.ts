export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Stations de démonstration à Douala (chargées si BDD vide)
const DEMO_STATIONS = [
  { nom:'Station Akwa',         quartier:'Akwa',         adresse:'Rue Joffre, Akwa',                      latitude:4.0511, longitude:9.7085, statut:'ACTIVE',      placesLibres:3, totalPlaces:3 },
  { nom:'Station Bonapriso',    quartier:'Bonapriso',    adresse:'Avenue de Gaulle, Bonapriso',           latitude:4.0390, longitude:9.6980, statut:'ACTIVE',      placesLibres:2, totalPlaces:3 },
  { nom:'Station Bonamoussadi', quartier:'Bonamoussadi', adresse:'Carrefour Bastos, Bonamoussadi',        latitude:4.0720, longitude:9.7310, statut:'ACTIVE',      placesLibres:0, totalPlaces:3 },
  { nom:'Station Deido',        quartier:'Deido',        adresse:'Boulevard de la Liberté, Deido',        latitude:4.0620, longitude:9.7180, statut:'ACTIVE',      placesLibres:2, totalPlaces:3 },
  { nom:'Station Bépanda',      quartier:'Bépanda',      adresse:'Carrefour Bépanda',                     latitude:4.0680, longitude:9.7420, statut:'ACTIVE',      placesLibres:1, totalPlaces:3 },
  { nom:'Station Logpom',       quartier:'Logpom',       adresse:'Rue de Logpom',                         latitude:4.0830, longitude:9.7250, statut:'MAINTENANCE', placesLibres:0, totalPlaces:3 },
  { nom:'Station Logbessou',    quartier:'Logbessou',    adresse:'Route de Logbessou',                    latitude:4.1050, longitude:9.7450, statut:'ACTIVE',      placesLibres:3, totalPlaces:3 },
  { nom:'Station Makepe',       quartier:'Makepe',       adresse:'Carrefour Makepe',                      latitude:4.0780, longitude:9.7520, statut:'ACTIVE',      placesLibres:1, totalPlaces:3 },
  { nom:'Station PK8',          quartier:'PK8',          adresse:'PK8, Route Nationale',                  latitude:4.0340, longitude:9.7650, statut:'ACTIVE',      placesLibres:2, totalPlaces:3 },
  { nom:'Station Yassa',        quartier:'Yassa',        adresse:'Zone Industrielle Yassa',               latitude:4.0150, longitude:9.7890, statut:'ACTIVE',      placesLibres:3, totalPlaces:3 },
  { nom:'Station Ndokoti',      quartier:'Ndokoti',      adresse:'Marché Ndokoti',                        latitude:4.0560, longitude:9.7350, statut:'ACTIVE',      placesLibres:2, totalPlaces:3 },
  { nom:'Station Bonabéri',     quartier:'Bonabéri',     adresse:'Route Bonabéri, Pont sur le Wouri',     latitude:4.0680, longitude:9.6580, statut:'ACTIVE',      placesLibres:3, totalPlaces:3 },
]

export async function GET() {
  try {
    let stations = await prisma.station.findMany({ orderBy: { nom: 'asc' } })
    if (stations.length === 0) {
      // Seed auto si vide
      await prisma.station.createMany({ data: DEMO_STATIONS as any })
      stations = await prisma.station.findMany({ orderBy: { nom: 'asc' } })
    }
    return NextResponse.json(stations)
  } catch {
    return NextResponse.json(DEMO_STATIONS)
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
    const { nom, adresse, quartier, latitude, longitude, heureOuverture, heureFermeture, totalPlaces, placesLibres, statut } = data

    if (!nom || !adresse || !quartier) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 })
    }

    const station = await prisma.station.create({
      data: {
        nom,
        adresse,
        quartier,
        latitude: Number(latitude || 0),
        longitude: Number(longitude || 0),
        heureOuverture: heureOuverture || '06:00',
        heureFermeture: heureFermeture || '22:00',
        totalPlaces: Number(totalPlaces || 3),
        placesLibres: Number(placesLibres || 3),
        statut: statut || 'ACTIVE'
      }
    })

    return NextResponse.json(station)
  } catch (e) {
    console.error('Error creating station:', e)
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
    const { id, nom, adresse, quartier, latitude, longitude, heureOuverture, heureFermeture, totalPlaces, placesLibres, statut } = data

    if (!id) return NextResponse.json({ message: 'ID manquant' }, { status: 400 })

    const updated = await prisma.station.update({
      where: { id: Number(id) },
      data: {
        nom,
        adresse,
        quartier,
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
        heureOuverture,
        heureFermeture,
        totalPlaces: totalPlaces !== undefined ? Number(totalPlaces) : undefined,
        placesLibres: placesLibres !== undefined ? Number(placesLibres) : undefined,
        statut
      }
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('Error updating station:', e)
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
    await prisma.wash.deleteMany({ where: { stationId: Number(id) } })

    const deleted = await prisma.station.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json(deleted)
  } catch (e) {
    console.error('Error deleting station:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
