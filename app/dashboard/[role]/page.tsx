'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const roleLabels: Record<string, string> = {
  coordinator: 'Coordinador',
  center: 'Encargado de centro',
  campaign: 'Líder de campaña',
  institution: 'Institución',
  volunteer: 'Voluntario'
}

export default function DashboardPage() {
  const params = useParams<{ role: string }>()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          router.replace('/login')
          return
        }
        const result = await response.json()
        if (active) setUser(result.data)
      })
      .catch(() => router.replace('/login'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [router])

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center">Cargando...</main>
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Panel de gestión</p>
        <h1 className="mt-2 text-3xl font-bold">{roleLabels[params.role] || 'Dashboard'}</h1>
        <p className="mt-3 text-slate-600">Bienvenido, {user?.name}.</p>
        <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.replace('/login')
          }}
          className="mt-8 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  )
}
