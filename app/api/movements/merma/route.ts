// src/app/api/movements/merma/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MermaApprovalService } from '@/services/merma-approval.service'
import { AuthService } from '@/services/auth.service'
import { canProposeMerma } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        if (!canProposeMerma(user.role)) {
            return NextResponse.json(
                { error: 'Sin permisos para proponer merma' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { centerId, itemId, quantity, reason, evidence } = body

        if (!centerId || !itemId || !quantity || !reason) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            )
        }

        const mermaRequest = await MermaApprovalService.proposeMerma({
            centerId,
            itemId,
            quantity,
            reason,
            requestedById: user.id,
            evidence
        })

        return NextResponse.json({
            success: true,
            data: mermaRequest,
            message: 'Solicitud de merma enviada para aprobación'
        })

    } catch (error: any) {
        console.error('Error proposing merma:', error)
        return NextResponse.json(
            { error: error.message || 'Error al proponer merma' },
            { status: 500 }
        )
    }
}