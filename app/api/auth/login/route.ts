import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json()

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email y contraseña son requeridos' },
				{ status: 400 }
			)
		}

		const result = await AuthService.login(email, password)
		return NextResponse.json({ success: true, data: result })
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || 'Error al iniciar sesión' },
			{ status: 401 }
		)
	}
}
