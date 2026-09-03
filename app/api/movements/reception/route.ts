// src/app/api/movements/reception/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MovementService } from '@/services/movement.service'
import { AuthService } from '@/services/auth.service'
import { canManageMovements } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar permisos
    if (!canManageMovements(user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para registrar recepciones' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { centerId, campaignId, itemId, quantity, donorName } = body

    // Validaciones
    if (!centerId || !campaignId || !itemId || !quantity) {
      return NextResponse.json(
        { error: 'Centro, campaña, artículo y cantidad son requeridos' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser positiva' },
        { status: 400 }
      )
    }

    // Registrar recepción
    const movement = await MovementService.registerReception({
      centerId,
      campaignId,
      itemId,
      quantity,
      actorId: user.id,
      donorName
    })

    return NextResponse.json({
      success: true,
      data: movement
    })

  } catch (error: any) {
    console.error('Error registering reception:', error)
    return NextResponse.json(
      { error: error.message || 'Error al registrar recepción' },
      { status: 500 }
    )
  }
}