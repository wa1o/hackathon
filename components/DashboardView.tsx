'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'

export function DashboardView({ role }: { role: 'coordinator' | 'center' | 'campaign' | 'institution' | 'volunteer' }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const endpoint = role === 'coordinator' ? '/api/dashboard/coordinator' : role === 'center' ? '/api/auth/me' : '/api/campaigns'
    fetch(endpoint, { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('No se pudieron cargar los datos')
      setData(await response.json())
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Error de carga'))
  }, [role])

  const title = { coordinator: 'Dashboard Coordinador', center: 'Dashboard del Centro', campaign: 'Mis Campañas', institution: 'Entregas recibidas', volunteer: 'Panel de voluntariado' }[role]
  if (error) return <AppShell title={title}><p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p></AppShell>
  if (!data) return <AppShell title={title}><p className="rounded-xl bg-white p-6">Cargando información...</p></AppShell>

  if (role === 'coordinator') {
    const stats = data.data
    return <AppShell title={title}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(stats.totals).map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm capitalize text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{String(value)}</p></div>)}</div>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/coordinator/campaigns/new" className="rounded-lg bg-cyan-500 px-4 py-3 font-semibold">Nueva campaña</Link><Link href="/dashboard/coordinator/centers/new" className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white">Nuevo centro</Link><Link href="/dashboard/coordinator/map" className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white">Ver mapa</Link></div>
      <section className="mt-6 rounded-xl bg-white p-5"><h2 className="font-semibold">Artículos más donados</h2>{stats.topItems.map((item: any) => <div key={item.name} className="flex justify-between border-b py-3"><span>{item.name}</span><strong>{item.totalQuantity} {item.unit}</strong></div>)}</section>
    </AppShell>
  }

  return <AppShell title={title}><div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-slate-600">{role === 'center' ? 'Consulta el estado de tu centro y registra movimientos.' : 'Consulta la información disponible para tu cuenta.'}</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard/center/movements/reception" className="rounded-lg bg-emerald-600 px-4 py-3 text-white">Registrar recepción</Link><Link href="/dashboard/center/movements/delivery" className="rounded-lg bg-orange-500 px-4 py-3 text-white">Registrar entrega</Link><Link href="/dashboard/coordinator/map" className="rounded-lg border px-4 py-3">Mapa de centros</Link></div></div></AppShell>
}
