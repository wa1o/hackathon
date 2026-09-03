// src/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

// GET - Listar campañas
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Si es ENCARGADO o VOLUNTARIO, solo ve campañas de sus centros
    if (user.role === 'ENCARGADO' || user.role === 'VOLUNTARIO') {
      const userCenters = await prisma.collectionCenter.findMany({
        where: {
          OR: [
            { managerId: user.id },
            { users: { some: { id: user.id } } }
          ]
        },
        select: { id: true }
      })

      where.centers = {
        some: {
          centerId: { in: userCenters.map(c => c.id) }
        }
      }
    }

    // Si es LIDER_CAMPANA, solo ve campañas donde es líder
    if (user.role === 'LIDER_CAMPANA') {
      where.leaders = {
        some: {
          leaderId: user.id,
          isActive: true
        }
      }
    }

    // Obtener campañas
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
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
          _count: {
            select: {
              movements: true,
              centers: true,
              leaders: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.campaign.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener campañas' },
      { status: 500 }
    )
  }
}

// POST - Crear campaña (solo coordinador)
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Solo coordinador puede crear campañas
    if (user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede crear campañas' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, startDate, endDate, centerIds } = body

    // Validaciones
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Nombre, fecha inicio y fecha fin son requeridos' },
        { status: 400 }
      )
    }

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha fin' },
        { status: 400 }
      )
    }

    // Crear campaña
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        centers: centerIds ? {
          create: centerIds.map((centerId: string) => ({
            centerId
          }))
        } : undefined
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
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear campaña' },
      { status: 500 }
    )
  }
}