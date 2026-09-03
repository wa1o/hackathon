import { NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'

export async function POST() {
	try {
		await AuthService.logout()
		return NextResponse.json({ success: true })
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || 'Error al cerrar sesión' },
			{ status: 500 }
		)
	}
}
