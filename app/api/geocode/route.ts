import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const query = request.nextUrl.searchParams.get('q')?.trim()
  if (!query || query.length < 3) return NextResponse.json({ success: true, data: [] })

  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      q: query,
      countrycodes: 'mx',
      addressdetails: '1',
      limit: '5'
    })
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CentroAyuda/1.0 (local development)'
      },
      next: { revalidate: 60 }
    })
    if (!response.ok) return NextResponse.json({ error: 'No se pudo consultar la ubicación' }, { status: 502 })
    const results = await response.json()
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Error searching location:', error)
    return NextResponse.json({ error: 'Servicio de ubicaciones no disponible' }, { status: 502 })
  }
}
