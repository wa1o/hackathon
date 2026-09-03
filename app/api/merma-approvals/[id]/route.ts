// src/app/api/merma-approvals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MermaApprovalService } from '@/services/merma-approval.service'
import { AuthService } from '@/services/auth.service'
import { canApproveMerma } from '@/lib/auth/roles'

// PUT - Aprobar o rechazar merma
export async function PUT(
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

        if (!canApproveMerma(user.role)) {
            return NextResponse.json(
                { error: 'Solo el coordinador puede aprobar mermas' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { action, campaignId } = body

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Acción inválida. Debe ser "approve" o "reject"' },
                { status: 400 }
            )
        }

        let result
        if (action === 'approve') {
            if (!campaignId) {
                return NextResponse.json(
                    { error: 'CampaignId es requerido para aprobar' },
                    { status: 400 }
                )
            }
            result = await MermaApprovalService.approveMerma(
                id,
                user.id,
                campaignId
            )
        } else {
            result = await MermaApprovalService.rejectMerma(id, user.id)
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: `Merma ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`
        })

    } catch (error: any) {
        console.error('Error processing merma:', error)
        return NextResponse.json(
            { error: error.message || 'Error al procesar merma' },
            { status: 500 }
        )
    }
}