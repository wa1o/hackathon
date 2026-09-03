import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { z } from 'zod'

const goalSchema = z.object({
  itemId: z.string().uuid(),
  targetQuantity: z.coerce.number().positive(),
  currentQuantity: z.coerce.number().nonnegative().optional()
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const goals = await prisma.campaignGoal.findMany({ where: { campaignId: (await params).id }, include: { item: true }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ success: true, data: goals })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede crear metas' }, { status: 403 })
    const campaignId = (await params).id
    const data = goalSchema.parse(await request.json())
    const goal = await prisma.campaignGoal.create({ data: { campaignId, itemId: data.itemId, targetQuantity: data.targetQuantity, currentQuantity: data.currentQuantity }, include: { item: true } })
    return NextResponse.json({ success: true, data: goal }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'No se pudo crear la meta' }, { status: 409 })
  }
}
