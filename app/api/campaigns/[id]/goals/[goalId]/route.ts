import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { z } from 'zod'

const updateSchema = z.object({
  targetQuantity: z.coerce.number().positive().optional(),
  currentQuantity: z.coerce.number().nonnegative().optional()
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; goalId: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede actualizar metas' }, { status: 403 })
    const { id, goalId } = await params
    const goal = await prisma.campaignGoal.updateMany({ where: { id: goalId, campaignId: id }, data: updateSchema.parse(await request.json()) })
    if (!goal.count) return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 })
    return NextResponse.json({ success: true, data: await prisma.campaignGoal.findUnique({ where: { id: goalId }, include: { item: true } }) })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'No se pudo actualizar la meta' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; goalId: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede eliminar metas' }, { status: 403 })
    const { id, goalId } = await params
    const deleted = await prisma.campaignGoal.deleteMany({ where: { id: goalId, campaignId: id } })
    if (!deleted.count) return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Meta eliminada' })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar la meta' }, { status: 500 })
  }
}
