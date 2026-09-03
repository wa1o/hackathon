// src/app/api/merma-approvals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MermaApprovalService } from '@/services/merma-approval.service'
import { AuthService } from '@/services/auth.service'
import { canApproveMerma } from '@/lib/auth/roles'

// GET - Obtener solicitudes pendientes
export async function GET(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            )
        }

        if (!canApproveMerma(user.role)) {
            return NextResponse.json(
                { error: 'Solo el coordinador puede ver solicitudes de merma' },
                { status: 403 }
            )
        }

        const pendingRequests = await MermaApprovalService.getPendingRequests()

        return NextResponse.json({
            success: true,
            data: pendingRequests
        })

    } catch (error: any) {
        console.error('Error fetching merma requests:', error)
        return NextResponse.json(
            { error: error.message || 'Error al obtener solicitudes' },
            { status: 500 }
        )
    }
}