import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { companyRequestSchema } from '@/lib/validation/company.schema'
import { rateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const key = request.headers.get('x-forwarded-for') || 'local'
    if (!rateLimit(`company-request:${key}`).allowed) return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' }, { status: 429 })
    const data = companyRequestSchema.parse(await request.json())
    const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    const existingRequest = await prisma.companyRegistrationRequest.findFirst({ where: { email: data.email.toLowerCase(), status: 'PENDIENTE' } })
    if (existingUser || existingRequest) return NextResponse.json({ error: 'Ya existe una cuenta o solicitud con ese correo.' }, { status: 409 })
    const requestRecord = await prisma.companyRegistrationRequest.create({
      data: { companyName: data.companyName, contactName: data.contactName, email: data.email.toLowerCase(), phone: data.phone, message: data.message, passwordHash: await hash(data.password, 10) },
      select: { id: true, companyName: true, contactName: true, email: true, phone: true, message: true, status: true, createdAt: true }
    })
    return NextResponse.json({ success: true, data: requestRecord, message: 'Solicitud enviada para revisión.' }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') return NextResponse.json({ error: 'Datos de solicitud inválidos.' }, { status: 400 })
    return NextResponse.json({ error: 'No se pudo enviar la solicitud.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') return NextResponse.json({ error: 'Solo el coordinador puede revisar solicitudes.' }, { status: 403 })
    const requests = await prisma.companyRegistrationRequest.findMany({ where: { status: 'PENDIENTE' }, select: { id: true, companyName: true, contactName: true, email: true, phone: true, message: true, status: true, createdAt: true }, orderBy: { createdAt: 'asc' } })
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error('Error loading company requests:', error)
    return NextResponse.json({ error: 'No se pudieron cargar las solicitudes.' }, { status: 500 })
  }
}
