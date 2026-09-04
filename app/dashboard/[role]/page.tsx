'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Fraunces, Public_Sans } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], display: 'swap' })
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })

const roleLabels: Record<string, string> = {
  coordinator: 'Coordinador',
  center: 'Encargado de centro',
  campaign: 'Líder de campaña',
  institution: 'Institución',
  volunteer: 'Voluntario'
}

function initialsFrom(name?: string) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function DashboardPage() {
  const params = useParams<{ role: string }>()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
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
        if (active) {
          const expectedRole = {
            coordinator: 'COORDINADOR',
            center: 'ENCARGADO',
            campaign: 'LIDER_CAMPANA',
            institution: 'INSTITUCION',
            volunteer: 'VOLUNTARIO'
          }[params.role]
          if (expectedRole && result.data.role !== expectedRole) {
            const destinationByRole: Record<string, string> = {
              COORDINADOR: 'coordinator',
              ENCARGADO: 'center',
              LIDER_CAMPANA: 'campaign',
              INSTITUCION: 'institution',
              VOLUNTARIO: 'volunteer'
            }
            const destination = destinationByRole[result.data.role] || 'volunteer'
            router.replace(`/dashboard/${destination}`)
          } else {
            setUser(result.data)
          }
        }
      })
      .catch(() => router.replace('/login'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [router])

  const roleLabel = roleLabels[params.role] || 'Dashboard'

  if (loading) {
    return (
      <main className={`${publicSans.className} min-h-screen bg-[#f7f3ec]`}>
        <div className="h-16 bg-[#101c2c]" />
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-40 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </main>
    )
  }

  return (
    <main className={`${publicSans.className} min-h-screen bg-[#f7f3ec]`}>
      <header className="bg-[#101c2c] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#dd9a34] text-sm font-bold text-[#101c2c]">
              CA
            </span>
            <span className="hidden text-sm font-medium text-[#93a7bd] sm:inline">Centro de Acopio</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[#dd9a34]/40 px-3 py-1 text-xs font-medium text-[#dd9a34] sm:inline-block">
              {roleLabel}
            </span>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                router.replace('/login')
              }}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-[#eef2f6] transition hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <p className="text-sm font-medium text-[#726a5c] sm:hidden">{roleLabel}</p>
        <h1 className={`${fraunces.className} mt-2 text-3xl text-[#1c2530] sm:text-4xl`}>
          Hola, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-2 text-[#726a5c]">Este es tu panel de {roleLabel.toLowerCase()}.</p>

        <div className="mt-8 flex items-center gap-4 rounded-xl border border-[#e4dccb] bg-white p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#101c2c] text-sm font-semibold text-[#dd9a34]">
            {initialsFrom(user?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#1c2530]">{user?.name}</p>
            <p className="truncate text-sm text-[#726a5c]">{user?.email}</p>
          </div>
        </div>
      </section>
    </main>
  )
}