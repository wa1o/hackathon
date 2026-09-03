import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.enum(['NO_PERECEDERO', 'PERECEDERO', 'ROPA', 'LIMPIEZA', 'MEDICAMENTO', 'OTRO']).optional(),
  unit: z.enum(['PIEZA', 'KG', 'L', 'BOLSA', 'CAJA']).optional(),
  umbralMinimo: z.coerce.number().nonnegative().nullable().optional()
})

async function idFrom(params: Promise<{ id: string }>) {
  return (await params).id
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const item = await prisma.item.findUnique({ where: { id: await idFrom(params) }, include: { _count: { select: { movements: true, goals: true } } } })
  if (!item) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, data: item })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede actualizar artículos' }, { status: 403 })
    const item = await prisma.item.update({ where: { id: await idFrom(params) }, data: itemSchema.parse(await request.json()) })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'Artículo no encontrado o no se pudo actualizar' }, { status: 404 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede eliminar artículos' }, { status: 403 })
    const id = await idFrom(params)
    const movements = await prisma.movement.count({ where: { itemId: id } })
    if (movements > 0) return NextResponse.json({ error: 'No se puede eliminar un artículo con movimientos históricos' }, { status: 409 })
    const item = await prisma.item.delete({ where: { id } })
    return NextResponse.json({ success: true, data: item })
  } catch {
    return NextResponse.json({ error: 'Artículo no encontrado o no se pudo eliminar' }, { status: 404 })
  }
}
