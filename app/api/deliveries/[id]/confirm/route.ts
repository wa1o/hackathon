import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const id = (await params).id
    const delivery = await prisma.delivery.findUnique({ where: { id } })
    if (!delivery) return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
    if (user.role === 'INSTITUCION' && delivery.institutionId !== user.id) return NextResponse.json({ error: 'No tienes acceso a esta entrega' }, { status: 403 })
    if (delivery.status !== 'PENDING') return NextResponse.json({ error: 'La entrega ya fue procesada' }, { status: 409 })
    const confirmed = await prisma.delivery.update({ where: { id }, data: { status: 'CONFIRMED', confirmedDate: new Date() }, include: { movement: true } })
    return NextResponse.json({ success: true, data: confirmed })
  } catch {
    return NextResponse.json({ error: 'No se pudo confirmar la entrega' }, { status: 500 })
  }
}
