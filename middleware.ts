// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Rutas públicas
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.some(route =>
    route === '/' ? request.nextUrl.pathname === '/' : request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  )
  const authToken = request.cookies.get('auth_token')?.value

  // Redirigir a login si no hay sesión
  if (!authToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}