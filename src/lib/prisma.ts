import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let prismaInstance: any = null

export function getPrisma() {
  if (!prismaInstance) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

// Lazy proxy - only connects when actually used
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    return getPrisma()[prop]
  }
})
