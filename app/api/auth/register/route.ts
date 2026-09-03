import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { AuthService } from '@/services/auth.service'
import { registerSchema } from '@/lib/validation/auth.schema'
import { rateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
	try {
		const body = registerSchema.parse(await request.json())
		const key = request.headers.get('x-forwarded-for') || 'local'
		if (!rateLimit(`register:${key}`).allowed) return NextResponse.json({ error: 'Demasiadas solicitudes. Espera un minuto.' }, { status: 429 })

		const user = await AuthService.register({
			email: body.email,
			password: body.password,
			name: body.name,
			role: body.role && Object.values(Role).includes(body.role) ? body.role : Role.VOLUNTARIO
		})

		return NextResponse.json({ success: true, data: user }, { status: 201 })
	} catch (error: any) {
		if (error?.name === 'ZodError') return NextResponse.json({ error: 'Datos de registro inválidos' }, { status: 400 })
		return NextResponse.json(
			{ error: error.message || 'Error al registrar usuario' },
			{ status: 400 }
		)
	}
}
