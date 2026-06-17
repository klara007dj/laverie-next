import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Load environment variables manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
    env.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length === 2) {
        const key = parts[0].trim()
        const val = parts[1].trim().replace(/"/g, '').replace(/\r/g, '')
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    })
  }
} catch (e) {
  console.error('Failed to load .env.local in seed:', e)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Clearing existing database...')
  await prisma.review.deleteMany()
  await prisma.wash.deleteMany()
  await prisma.voucher.deleteMany()
  try {
    await prisma.walletTransaction.deleteMany()
    await prisma.wallet.deleteMany()
    await prisma.vehicle.deleteMany()
  } catch (err) {
    console.log('Relations tables not yet fully created, ignoring drop errors')
  }
  await prisma.user.deleteMany()
  await prisma.station.deleteMany()
  await prisma.service.deleteMany()

  console.log('🌱 Seeding database...')

  // Services
  const servicesData = [
    { id: 1, nom: 'Lavage Express',           description: 'Nettoyage rapide en 30 min.',            prixFcfa: 8000,  durationMinutes: 30,  icon: 'Zap' },
    { id: 2, nom: 'Lavage Extérieur Complet', description: 'Carrosserie, châssis, jantes complète.',  prixFcfa: 15000, durationMinutes: 45,  icon: 'Droplets' },
    { id: 3, nom: 'Nettoyage Moteur',         description: 'Dégraissage moteur complet.',             prixFcfa: 10000, durationMinutes: 60,  icon: 'Settings' },
    { id: 4, nom: 'Désinfection Cabine',      description: 'Traitement désinfectant habitacle.',       prixFcfa: 10000, durationMinutes: 60,  icon: 'ShieldCheck' },
    { id: 5, nom: 'Éco-lavage',               description: '70% moins d\'eau, produits bio.',          prixFcfa: 12000, durationMinutes: 50,  icon: 'Leaf' },
    { id: 6, nom: 'Lavage Citerne/Benne',     description: 'Spécialisé citernes et semi-remorques.',  prixFcfa: 35000, durationMinutes: 90,  icon: 'Truck' },
    { id: 7, nom: 'Anti-corrosion',           description: 'Traitement protecteur châssis.',           prixFcfa: 18000, durationMinutes: 120, icon: 'Shield' },
  ]
  const services = await Promise.all(
    servicesData.map(s => prisma.service.create({ data: s }))
  )
  console.log(`✅ ${services.length} services créés`)

  // Stations Douala (toutes ont une capacité de 3 places max)
  const stationsData = [
    { nom:'Station Akwa',         quartier:'Akwa',         adresse:'Rue Joffre, Akwa, Douala',                latitude:4.0511, longitude:9.7085, statut:'ACTIVE' as const,      placesLibres:3, totalPlaces:3 },
    { nom:'Station Bonapriso',    quartier:'Bonapriso',    adresse:'Avenue de Gaulle, Bonapriso, Douala',     latitude:4.0390, longitude:9.6980, statut:'ACTIVE' as const,      placesLibres:2, totalPlaces:3 },
    { nom:'Station Bonamoussadi', quartier:'Bonamoussadi', adresse:'Carrefour Bastos, Bonamoussadi, Douala',  latitude:4.0720, longitude:9.7310, statut:'ACTIVE' as const,      placesLibres:0, totalPlaces:3 },
    { nom:'Station Deido',        quartier:'Deido',        adresse:'Bd de la Liberté, Deido, Douala',         latitude:4.0620, longitude:9.7180, statut:'ACTIVE' as const,      placesLibres:2, totalPlaces:3 },
    { nom:'Station Bépanda',      quartier:'Bépanda',      adresse:'Carrefour Bépanda, Douala',               latitude:4.0680, longitude:9.7420, statut:'ACTIVE' as const,      placesLibres:1, totalPlaces:3 },
    { nom:'Station Logpom',       quartier:'Logpom',       adresse:'Rue de Logpom, Douala',                   latitude:4.0830, longitude:9.7250, statut:'MAINTENANCE' as const, placesLibres:0, totalPlaces:3 },
    { nom:'Station Logbessou',    quartier:'Logbessou',    adresse:'Route de Logbessou, Douala',              latitude:4.1050, longitude:9.7450, statut:'ACTIVE' as const,      placesLibres:3, totalPlaces:3 },
    { nom:'Station Makepe',       quartier:'Makepe',       adresse:'Carrefour Makepe, Douala',                latitude:4.0780, longitude:9.7520, statut:'ACTIVE' as const,      placesLibres:1, totalPlaces:3 },
    { nom:'Station PK8',          quartier:'PK8',          adresse:'PK8, Route Nationale, Douala',            latitude:4.0340, longitude:9.7650, statut:'ACTIVE' as const,      placesLibres:2, totalPlaces:3 },
    { nom:'Station Yassa',        quartier:'Yassa',        adresse:'Zone Industrielle Yassa, Douala',         latitude:4.0150, longitude:9.7890, statut:'ACTIVE' as const,      placesLibres:3, totalPlaces:3 },
    { nom:'Station Ndokoti',      quartier:'Ndokoti',      adresse:'Marché Ndokoti, Douala',                  latitude:4.0560, longitude:9.7350, statut:'ACTIVE' as const,      placesLibres:2, totalPlaces:3 },
    { nom:'Station Bonabéri',     quartier:'Bonabéri',     adresse:'Route Bonabéri, Douala',                  latitude:4.0680, longitude:9.6580, statut:'ACTIVE' as const,      placesLibres:3, totalPlaces:3 },
  ]
  await prisma.station.createMany({ data: stationsData })
  console.log(`✅ 12 stations Douala créées (capacité 3 max)`)

  const stationAkwa = await prisma.station.findFirst({ where: { nom: 'Station Akwa' } })
  const stationBonapriso = await prisma.station.findFirst({ where: { nom: 'Station Bonapriso' } })
  const stationDeido = await prisma.station.findFirst({ where: { nom: 'Station Deido' } })

  // Admin par défaut
  await prisma.user.create({
    data: { nom: 'Admin', prenom: 'LaveriePro', email: 'admin@gmail.com', passwordHash: await bcrypt.hash('Admin2025!', 12), role: 'ADMIN' }
  })
  console.log('✅ Compte admin créé (admin@gmail.com / Admin2025!)')

  console.log('✅ Seed terminé !')
}

main().catch(console.error).finally(() => prisma.$disconnect())
