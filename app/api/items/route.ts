import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum(['NO_PERECEDERO', 'PERECEDERO', 'ROPA', 'LIMPIEZA', 'MEDICAMENTO', 'OTRO']).optional(),
  unit: z.enum(['PIEZA', 'KG', 'L', 'BOLSA', 'CAJA']).optional(),
  umbralMinimo: z.coerce.number().nonnegative().nullable().optional()
})

export async function GET() {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const items = await prisma.item.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ success: true, data: items })
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede crear artículos' }, { status: 403 })
    const data = itemSchema.parse(await request.json())
    const item = await prisma.item.create({ data: { name: data.name, category: data.category, unit: data.unit, umbralMinimo: data.umbralMinimo } })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'Error al crear artículo' }, { status: 500 })
  }
}
