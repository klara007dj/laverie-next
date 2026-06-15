import { prisma } from './prisma'

export const LOYALTY_RULES = [
  { minWashes: 5,  type: 'REDUCTION' as const, valeur: 5,  label: 'Bronze', description: '5% de réduction sur votre prochain lavage' },
  { minWashes: 10, type: 'REDUCTION' as const, valeur: 10, label: 'Argent', description: '10% de réduction sur votre prochain lavage' },
  { minWashes: 20, type: 'GRATUIT'   as const, valeur: 0,  label: 'Or',     description: 'Lavage gratuit offert !' },
]

function makeCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return 'LAVPRO-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function generateVoucherIfEligible(userId: number, totalWashes: number) {
  const rule = LOYALTY_RULES.find(r => r.minWashes === totalWashes)
  if (!rule) return null

  const existing = await prisma.voucher.findFirst({
    where: { userId, description: rule.description, used: false },
  })
  if (existing) return null

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 3)

  return prisma.voucher.create({
    data: {
      userId,
      code: makeCode(),
      type: rule.type,
      valeur: rule.valeur,
      description: rule.description,
      expiresAt,
    },
  })
}

export function getLoyaltyProgress(totalWashes: number) {
  const thresholds = [5, 10, 20]
  const next = thresholds.find(t => t > totalWashes) ?? 20
  const prev = [...thresholds].reverse().find(t => t <= totalWashes) ?? 0
  const progress =
    prev === 0
      ? (totalWashes / next) * 100
      : ((totalWashes - prev) / (next - prev)) * 100
  return {
    next,
    progress: Math.min(Math.round(progress), 100),
    remaining: Math.max(next - totalWashes, 0),
  }
}
