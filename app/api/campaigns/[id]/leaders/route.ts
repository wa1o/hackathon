import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { z } from 'zod'

const leaderSchema = z.object({ leaderId: z.string().uuid() })

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const leaders = await prisma.campaignLeader.findMany({ where: { campaignId: (await params).id, isActive: true }, include: { leader: { select: { id: true, name: true, email: true, role: true } } } })
  return NextResponse.json({ success: true, data: leaders })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede asignar líderes' }, { status: 403 })
    const data = leaderSchema.parse(await request.json())
    const campaignId = (await params).id
    const leader = await prisma.user.findUnique({ where: { id: data.leaderId } })
    if (!leader || leader.role !== 'LIDER_CAMPANA') return NextResponse.json({ error: 'El usuario no es un líder de campaña' }, { status: 400 })
    const relation = await prisma.campaignLeader.upsert({ where: { campaignId_leaderId: { campaignId, leaderId: data.leaderId } }, update: { isActive: true }, create: { campaignId, leaderId: data.leaderId }, include: { leader: { select: { id: true, name: true, email: true, role: true } } } })
    return NextResponse.json({ success: true, data: relation }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'No se pudo asignar el líder' }, { status: 409 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede remover líderes' }, { status: 403 })
    const { leaderId } = leaderSchema.parse(await request.json())
    const deleted = await prisma.campaignLeader.updateMany({ where: { campaignId: (await params).id, leaderId }, data: { isActive: false } })
    if (!deleted.count) return NextResponse.json({ error: 'Líder no encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Líder removido' })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'No se pudo remover el líder' }, { status: 500 })
  }
}
