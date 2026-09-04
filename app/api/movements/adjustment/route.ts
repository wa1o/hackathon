// src/app/api/movements/adjustment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MovementService } from '@/services/movement.service'
import { AuthService } from '@/services/auth.service'
import { canOperateCenter } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Solo coordinador o encargado pueden hacer ajustes
    if (!['COORDINADOR', 'ENCARGADO'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para realizar ajustes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { centerId, campaignId, itemId, quantity, reason } = body

    if (!canOperateCenter(user, centerId)) {
      return NextResponse.json({ error: 'Solo puedes operar tu centro asignado' }, { status: 403 })
    }

    if (!centerId || !campaignId || !itemId || quantity === undefined || !reason) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const movement = await MovementService.registerAdjustment({
      centerId,
      campaignId,
      itemId,
      quantity,
      actorId: user.id,
      reason
    })

    return NextResponse.json({
      success: true,
      data: movement
    })

  } catch (error: any) {
    console.error('Error registering adjustment:', error)
    return NextResponse.json(
      { error: error.message || 'Error al registrar ajuste' },
      { status: 500 }
    )
  }
}