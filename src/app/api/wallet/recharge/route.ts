export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

    const { userId } = verifyToken(token)
    const body = await req.json()
    const { montant, moyenPaiement, simulateFail } = body

    if (!montant || !moyenPaiement) {
      return NextResponse.json({ message: 'Données manquantes (montant, moyenPaiement requis)' }, { status: 400 })
    }

    const amountNum = Number(montant)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ message: 'Montant invalide' }, { status: 400 })
    }

    // Find user's wallet
    let wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) {
      // Auto-create wallet if it doesn't exist for some reason
      wallet = await prisma.wallet.create({ data: { userId, solde: 0 } })
    }

    if (simulateFail) {
      // Record failed transaction
      const tx = await prisma.walletTransaction.create({
        data: {
          userId,
          montant: amountNum,
          type: 'RECHARGE',
          moyenPaiement,
          statut: 'ECHOUEE'
        }
      })
      return NextResponse.json({
        message: 'La transaction de paiement a échoué. Veuillez réessayer.',
        statut: 'ECHOUEE',
        transaction: tx,
        wallet
      }, { status: 400 })
    }

    // Success transaction
    const tx = await prisma.walletTransaction.create({
      data: {
        userId,
        montant: amountNum,
        type: 'RECHARGE',
        moyenPaiement,
        statut: 'REUSSIE'
      }
    })

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { solde: { increment: amountNum } }
    })

    return NextResponse.json({
      message: 'Rechargement effectué avec succès !',
      statut: 'REUSSIE',
      transaction: tx,
      wallet: updatedWallet
    })
  } catch (e) {
    console.error('Error recharging wallet:', e)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
}
