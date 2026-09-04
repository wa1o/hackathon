import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { companyDecisionSchema } from '@/lib/validation/company.schema'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const reviewer = await AuthService.getCurrentUser()
    if (!reviewer || reviewer.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede autorizar solicitudes.' }, { status: 403 })
    const { decision } = companyDecisionSchema.parse(await request.json())
    const id = (await params).id
    const requestRecord = await prisma.companyRegistrationRequest.findUnique({ where: { id } })
    if (!requestRecord) return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
    if (requestRecord.status !== 'PENDIENTE') return NextResponse.json({ error: 'La solicitud ya fue revisada.' }, { status: 409 })

    if (decision === 'reject') {
      const rejected = await prisma.companyRegistrationRequest.update({ where: { id }, data: { status: 'RECHAZADA', reviewedAt: new Date(), reviewedById: reviewer.id }, select: { id: true, status: true, reviewedAt: true } })
      return NextResponse.json({ success: true, data: rejected })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: requestRecord.email } })
    if (existingUser) return NextResponse.json({ error: 'Ya existe un usuario con ese correo.' }, { status: 409 })
    const result = await prisma.$transaction(async (tx) => {
      const institution = await tx.user.create({ data: { email: requestRecord.email, passwordHash: requestRecord.passwordHash, name: requestRecord.companyName, role: 'INSTITUCION' }, select: { id: true, name: true, email: true, role: true } })
      const approved = await tx.companyRegistrationRequest.update({ where: { id }, data: { status: 'APROBADA', reviewedAt: new Date(), reviewedById: reviewer.id }, select: { id: true, status: true, reviewedAt: true } })
      return { institution, request: approved }
    })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') return NextResponse.json({ error: 'Decisión inválida.' }, { status: 400 })
    return NextResponse.json({ error: 'No se pudo procesar la solicitud.' }, { status: 500 })
  }
}
