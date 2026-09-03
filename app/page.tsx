// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      const response = await fetch('/api/auth/me', { cache: 'no-store' })
      const { data: user } = response.ok ? await response.json() : { data: null }
      
      if (user) {
        // Redirigir según el rol
        switch (user.role) {
          case 'COORDINADOR':
            router.push('/dashboard/coordinator')
            break
          case 'ENCARGADO':
            router.push('/dashboard/center')
            break
          case 'LIDER_CAMPANA':
            router.push('/dashboard/campaign')
            break
          case 'INSTITUCION':
            router.push('/dashboard/institution')
            break
          default:
            router.push('/dashboard/volunteer')
        }
      } else {
        // No autenticado → ir a login
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}