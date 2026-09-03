import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export async function GET() {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const where = user.role === 'INSTITUCION' ? { institutionId: user.id } : {}
  const deliveries = await prisma.delivery.findMany({ where, include: { movement: { include: { item: true, campaign: true, center: true } }, institution: { select: { id: true, name: true, email: true } } }, orderBy: { deliveryDate: 'desc' } })
  return NextResponse.json({ success: true, data: deliveries })
}
