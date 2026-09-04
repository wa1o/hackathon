import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { AuthService } from '@/services/auth.service'
import { registerSchema } from '@/lib/validation/auth.schema'
import { rateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
	try {
		const currentUser = await AuthService.getCurrentUser()
		if (!currentUser || currentUser.role !== 'COORDINADOR') {
			return NextResponse.json({ error: 'El registro de usuarios internos solo lo puede realizar un coordinador.' }, { status: 403 })
		}
		const body = registerSchema.parse(await request.json())
		if (body.role !== 'ENCARGADO' && body.role !== 'VOLUNTARIO') {
			return NextResponse.json({ error: 'Solo puedes registrar encargados o voluntarios.' }, { status: 400 })
		}
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
