import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json(
		{ error: 'Usa un endpoint de movimiento específico' },
		{ status: 405, headers: { Allow: 'POST' } }
	)
}
