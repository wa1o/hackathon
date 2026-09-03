import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { QRService } from '@/services/qr.service'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await AuthService.getCurrentUser()
  if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede generar QR' }, { status: 403 })
  const id = (await params).id
  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
  const url = await QRService.regenerateQR(id)
  return NextResponse.json({ success: true, data: { url } })
}
