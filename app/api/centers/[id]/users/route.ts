// src/app/api/centers/[id]/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

// POST - Asignar usuario a centro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede asignar usuarios' },
        { status: 403 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    if (targetUser.role !== 'ENCARGADO' && targetUser.role !== 'VOLUNTARIO') {
      return NextResponse.json({ error: 'Solo se pueden asignar encargados o voluntarios' }, { status: 400 })
    }

    // Asignar usuario al centro
    const center = await prisma.collectionCenter.update({
      where: { id },
      data: {
        users: {
          connect: { id: userId }
        }
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: center,
      message: 'Usuario asignado al centro exitosamente'
    })

  } catch (error: any) {
    console.error('Error assigning user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al asignar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Remover usuario del centro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede remover usuarios' },
        { status: 403 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId es requerido' },
        { status: 400 }
      )
    }

    const center = await prisma.collectionCenter.update({
      where: { id },
      data: {
        users: {
          disconnect: { id: userId }
        }
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: center,
      message: 'Usuario removido del centro exitosamente'
    })

  } catch (error: any) {
    console.error('Error removing user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al remover usuario' },
      { status: 500 }
    )
  }
}