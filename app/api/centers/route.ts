// src/app/api/centers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { GeocodeService } from '@/services/geocode.service'

// GET - Listar centros (con filtros)
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('isActive')
    const campaignId = searchParams.get('campaignId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (isActive !== null) where.isActive = isActive === 'true'
    
    if (campaignId) {
      where.campaigns = { some: { campaignId } }
    }

    // Si es ENCARGADO, solo ve su centro
    if (user.role === 'ENCARGADO' && user.managedCenter) {
      where.id = user.managedCenter.id
    }

    const [centers, total] = await Promise.all([
      prisma.collectionCenter.findMany({
        where,
        include: {
          manager: {
            select: { id: true, name: true, email: true }
          },
          campaigns: {
            include: {
              campaign: {
                select: { id: true, name: true, isActive: true }
              }
            }
          },
          _count: {
            select: { movements: true, users: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.collectionCenter.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: centers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })

  } catch (error: any) {
    console.error('Error fetching centers:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener centros' },
      { status: 500 }
    )
  }
}

// POST - Crear centro (solo coordinador)
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede crear centros' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, institution, location, address, phone, schedule, contactPerson, managerId, latitude: providedLatitude, longitude: providedLongitude } = body

    // Validaciones
    if (!name || !institution || !location) {
      return NextResponse.json(
        { error: 'Nombre, institución y ubicación son requeridos' },
        { status: 400 }
      )
    }

    // Geocodificar dirección
    let latitude: number | null = null
    let longitude: number | null = null
    if (typeof providedLatitude === 'number' && typeof providedLongitude === 'number') {
      latitude = providedLatitude
      longitude = providedLongitude
    } else if (address || location || name) {
      const coords = await GeocodeService.geocodeAddress([name, address || location].filter(Boolean).join(', '))
      if (coords) {
        latitude = coords.lat
        longitude = coords.lon
      }
    }

    // Crear centro
    const center = await prisma.collectionCenter.create({
      data: {
        name,
        institution,
        location,
        address: address || location,
        latitude,
        longitude,
        phone,
        schedule,
        contactPerson,
        managerId: managerId || undefined,
        isActive: true
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: center,
      message: 'Centro creado exitosamente'
    })

  } catch (error: any) {
    console.error('Error creating center:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear centro' },
      { status: 500 }
    )
  }
}