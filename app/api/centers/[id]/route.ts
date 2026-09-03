// src/app/api/centers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'
import { GeocodeService } from '@/services/geocode.service'

// GET - Obtener centro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const center = await prisma.collectionCenter.findUnique({
      where: { id },
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
        users: {
          select: { id: true, name: true, email: true, role: true }
        },
        movements: {
          take: 20,
          orderBy: { date: 'desc' },
          include: {
            item: true,
            actor: {
              select: { name: true, email: true }
            }
          }
        },
        _count: {
          select: { movements: true, users: true }
        }
      }
    })

    if (!center) {
      return NextResponse.json(
        { error: 'Centro no encontrado' },
        { status: 404 }
      )
    }

    // Verificar acceso (encargado solo ve su centro)
    if (user.role === 'ENCARGADO' && center.managerId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes acceso a este centro' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: center
    })

  } catch (error: any) {
    console.error('Error fetching center:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener centro' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar centro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede actualizar centros' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, institution, location, address, phone, schedule, contactPerson, managerId, isActive } = body

    const existing = await prisma.collectionCenter.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Centro no encontrado' },
        { status: 404 }
      )
    }

    // Si cambió la dirección, geocodificar
    let latitude = existing.latitude
    let longitude = existing.longitude
    const newAddress = address || location
    if (newAddress && newAddress !== existing.address && newAddress !== existing.location) {
      const coords = await GeocodeService.geocodeAddress(newAddress)
      if (coords) {
        latitude = coords.lat
        longitude = coords.lon
      }
    }

    const center = await prisma.collectionCenter.update({
      where: { id },
      data: {
        name: name || undefined,
        institution: institution || undefined,
        location: location || undefined,
        address: address || location || undefined,
        latitude,
        longitude,
        phone: phone !== undefined ? phone : undefined,
        schedule: schedule !== undefined ? schedule : undefined,
        contactPerson: contactPerson !== undefined ? contactPerson : undefined,
        managerId: managerId !== undefined ? managerId : undefined,
        isActive: isActive !== undefined ? isActive : undefined
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
      message: 'Centro actualizado exitosamente'
    })

  } catch (error: any) {
    console.error('Error updating center:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar centro' },
      { status: 500 }
    )
  }
}

// DELETE - Desactivar centro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede desactivar centros' },
        { status: 403 }
      )
    }

    const center = await prisma.collectionCenter.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      data: center,
      message: 'Centro desactivado exitosamente'
    })

  } catch (error: any) {
    console.error('Error deactivating center:', error)
    return NextResponse.json(
      { error: error.message || 'Error al desactivar centro' },
      { status: 500 }
    )
  }
}