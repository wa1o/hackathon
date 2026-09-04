import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export async function GET() {
  try {
    if (!await AuthService.getCurrentUser()) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== 'COORDINADOR') {
      return NextResponse.json({ error: 'Solo el coordinador puede crear usuarios' }, { status: 403 })
    }

    const body = await request.json()
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
    }
    if (body.role !== 'ENCARGADO' && body.role !== 'VOLUNTARIO') {
      return NextResponse.json({ error: 'Solo puedes registrar encargados o voluntarios de centro' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        passwordHash: await hash(body.password, 10),
        role: body.role
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
