import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { AuthService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
	try {
		const { email, password, name, role } = await request.json()

		if (!email || !password || !name) {
			return NextResponse.json(
				{ error: 'Email, contraseña y nombre son requeridos' },
				{ status: 400 }
			)
		}

		const user = await AuthService.register({
			email,
			password,
			name,
			role: role && Object.values(Role).includes(role) ? role : Role.VOLUNTARIO
		})

		return NextResponse.json({ success: true, data: user }, { status: 201 })
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || 'Error al registrar usuario' },
			{ status: 400 }
		)
	}
}
