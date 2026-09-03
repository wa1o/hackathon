// services/qr.service.ts
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { hash } from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key'

interface QRTokenPayload {
  campaignId: string
  singleUse: true
  exp: number
}

export class QRService {
  // Generar token para QR
  static generateToken(campaignId: string): string {
    const payload: QRTokenPayload = {
      campaignId,
      singleUse: true,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }

    return jwt.sign(payload, JWT_SECRET)
  }

  // Generar URL para QR
  static generateQRUrl(campaignId: string): string {
    const token = this.generateToken(campaignId)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/campaign/join/${token}`
  }

  // Validar token
  static async validateToken(token: string): Promise<{ campaignId: string }> {
    try {
      // 1. Verificar firma y expiración
      const decoded = jwt.verify(token, JWT_SECRET) as QRTokenPayload

      // 2. Verificar que no haya sido usado
      const campaign = await prisma.campaign.findFirst({
        where: {
          qrTokenHash: await hash(token, 10)
        }
      })

      if (campaign) {
        throw new Error('Este QR ya fue utilizado')
      }

      return { campaignId: decoded.campaignId }
    } catch (error) {
      throw new Error('QR inválido o expirado')
    }
  }

  // Marcar token como usado
  static async markTokenAsUsed(campaignId: string, token: string) {
    const tokenHash = await hash(token, 10)
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        qrTokenHash: tokenHash,
        qrExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        qrCodeGenerated: true
      }
    })
  }

  // Regenerar QR (invalida el anterior)
  static async regenerateQR(campaignId: string): Promise<string> {
    // Limpiar token anterior
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        qrTokenHash: null,
        qrExpiresAt: null,
        qrCodeGenerated: false
      }
    })

    // Generar nuevo
    return this.generateQRUrl(campaignId)
  }

  // Unir líder a campaña via QR
  static async joinCampaign(token: string, userId: string) {
    // 1. Validar token
    const { campaignId } = await this.validateToken(token)

    // 2. Verificar campaña activa
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId, isActive: true }
    })

    if (!campaign) {
      throw new Error('Campaña no disponible')
    }

    // 3. Verificar que el usuario es LÍDER
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.role !== 'LIDER_CAMPANA') {
      throw new Error('Solo líderes de campaña pueden unirse')
    }

    // 4. Crear relación
    const leaderCampaign = await prisma.campaignLeader.create({
      data: {
        campaignId,
        leaderId: userId,
        isActive: true
      }
    })

    // 5. Marcar token como usado
    await this.markTokenAsUsed(campaignId, token)

    return { leaderCampaign, campaign }
  }
}