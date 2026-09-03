// src/app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

// GET - Obtener campaña
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        centers: {
          include: {
            center: true
          }
        },
        leaders: {
          include: {
            leader: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        goals: {
          include: {
            item: true
          }
        },
        movements: {
          include: {
            item: true,
            center: true,
            actor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          take: 20,
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: campaign
    })

  } catch (error: any) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener campaña' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar campaña
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede actualizar campañas' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, startDate, endDate, isActive, centerIds } = body

    // Validar que existe
    const existing = await prisma.campaign.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        ...(centerIds && {
          centers: {
            deleteMany: {},
            create: centerIds.map((centerId: string) => ({
              centerId
            }))
          }
        })
      },
      include: {
        centers: {
          include: {
            center: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: campaign
    })

  } catch (error: any) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar campaña' },
      { status: 500 }
    )
  }
}

// DELETE - Desactivar campaña (no eliminar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede desactivar campañas' },
        { status: 403 }
      )
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaña desactivada exitosamente',
      data: campaign
    })

  } catch (error: any) {
    console.error('Error deactivating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Error al desactivar campaña' },
      { status: 500 }
    )
  }
}