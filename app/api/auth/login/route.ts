import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { loginSchema } from '@/lib/validation/auth.schema'
import { rateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
	try {
		const body = loginSchema.parse(await request.json())
		const key = request.headers.get('x-forwarded-for') || 'local'
		if (!rateLimit(`login:${key}`).allowed) {
			return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 })
		}

		const result = await AuthService.login(body.email, body.password)
		return NextResponse.json({ success: true, data: result })
	} catch (error: any) {
		if (error?.name === 'ZodError') return NextResponse.json({ error: 'Email o contraseña inválidos' }, { status: 400 })
		return NextResponse.json(
			{ error: error.message || 'Error al iniciar sesión' },
			{ status: 401 }
		)
	}
}
