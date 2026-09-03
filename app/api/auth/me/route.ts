import { NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'

export async function GET() {
	try {
		const user = await AuthService.getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		return NextResponse.json({ success: true, data: user })
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || 'Error al obtener usuario' },
			{ status: 500 }
		)
	}
}
