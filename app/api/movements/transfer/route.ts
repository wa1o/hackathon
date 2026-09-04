// src/app/api/movements/transfer/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MovementService } from '@/services/movement.service'
import { AuthService } from '@/services/auth.service'
import { canManageMovements, canOperateCenter } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (!canManageMovements(user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para registrar transferencias' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { originCenterId, targetCenterId, campaignId, itemId, quantity } = body

    if (!canOperateCenter(user, originCenterId)) {
      return NextResponse.json({ error: 'Solo puedes transferir desde tu centro asignado' }, { status: 403 })
    }

    // Validaciones
    if (!originCenterId || !targetCenterId || !campaignId || !itemId || !quantity) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser positiva' },
        { status: 400 }
      )
    }

    if (originCenterId === targetCenterId) {
      return NextResponse.json(
        { error: 'Los centros deben ser distintos' },
        { status: 400 }
      )
    }

    const result = await MovementService.registerTransfer({
      originCenterId,
      targetCenterId,
      campaignId,
      itemId,
      quantity,
      actorId: user.id
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Error registering transfer:', error)
    return NextResponse.json(
      { error: error.message || 'Error al registrar transferencia' },
      { status: 500 }
    )
  }
}