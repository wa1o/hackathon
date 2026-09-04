'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { WeeklyStockChart } from '@/components/WeeklyStockChart'

export function DashboardView({ role }: { role: 'coordinator' | 'center' | 'campaign' | 'institution' | 'volunteer' }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  const readResponse = async (response: Response) => {
    const text = await response.text()
    let result: any = {}
    try { result = text ? JSON.parse(text) : {} } catch { throw new Error(`Respuesta inválida de ${response.url}`) }
    if (!response.ok) throw new Error(result.error || `Error ${response.status} en ${response.url}`)
    return result
  }

  useEffect(() => {
    const load = async () => {
      if (role === 'coordinator') {
        const [statsResponse, stockResponse] = await Promise.all([fetch('/api/dashboard/coordinator', { credentials: 'same-origin', cache: 'no-store' }), fetch('/api/dashboard/stock-weekly', { credentials: 'same-origin', cache: 'no-store' })])
        const [stats, weeklyStock] = await Promise.all([readResponse(statsResponse), readResponse(stockResponse)])
        setData({ stats: stats.data, weeklyStock: weeklyStock.data })
        return
      }
      if (role === 'center') {
        const userResponse = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
        const userResult = await readResponse(userResponse)
        const centerId = userResult.data?.managedCenter?.id
        if (!centerId) throw new Error('No tienes un centro asignado')
        const [centerResponse, stockResponse] = await Promise.all([fetch(`/api/dashboard/center?centerId=${centerId}`, { credentials: 'same-origin', cache: 'no-store' }), fetch(`/api/dashboard/stock-weekly?centerId=${centerId}`, { credentials: 'same-origin', cache: 'no-store' })])
        const [center, weeklyStock] = await Promise.all([readResponse(centerResponse), readResponse(stockResponse)])
        setData({ center: center.data, weeklyStock: weeklyStock.data })
        return
      }
      const endpoint = role === 'volunteer' ? '/api/auth/me' : '/api/campaigns'
      const response = await fetch(endpoint, { credentials: 'same-origin', cache: 'no-store' })
      setData(await readResponse(response))
    }
    load().catch((reason) => setError(reason instanceof Error ? reason.message : 'Error de carga'))
  }, [role])

  const title = { coordinator: 'Dashboard Coordinador', center: 'Dashboard del Centro', campaign: 'Mis Campañas', institution: 'Entregas recibidas', volunteer: 'Panel de voluntariado' }[role]
  if (error) return <AppShell title={title}><p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p></AppShell>
  if (!data) return <AppShell title={title}><p className="rounded-xl bg-white p-6">Cargando información...</p></AppShell>

  if (role === 'coordinator') {
    const stats = data.stats
    return <AppShell title={title}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(stats.totals).map(([label, value]) => <div key={label} className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm capitalize text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{String(value)}</p></div>)}</div>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/coordinator/campaigns/new" className="rounded-lg bg-cyan-500 px-4 py-3 font-semibold">Nueva campaña</Link><Link href="/dashboard/coordinator/centers/new" className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white">Nuevo centro</Link><Link href="/dashboard/coordinator/map" className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white">Ver mapa</Link></div>
      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Stock semanal</h2><p className="text-sm text-slate-600">Evolución acumulada de los artículos con mayor movimiento.</p></div><WeeklyStockChart data={data.weeklyStock} /></section>
      <section className="mt-6 rounded-xl bg-white p-5"><h2 className="font-semibold">Artículos más donados</h2>{stats.topItems.map((item: any) => <div key={item.name} className="flex justify-between border-b py-3"><span>{item.name}</span><strong>{item.totalQuantity} {item.unit}</strong></div>)}</section>
    </AppShell>
  }

  if (role === 'center') return <AppShell title={title}><div className="rounded-xl bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">{data.center.center.name}</h2><p className="mt-1 text-slate-600">{data.center.center.institution} · {data.center.center.location}</p><div className="mt-5 grid gap-3 sm:grid-cols-4">{Object.entries(data.center.totals).map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs capitalize text-slate-500">{label}</p><strong className="text-xl text-slate-900">{String(value)}</strong></div>)}</div><div className="mt-6"><h3 className="mb-3 font-semibold text-slate-900">Stock semanal</h3><WeeklyStockChart data={data.weeklyStock} /></div><div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard/center/movements/reception" className="rounded-lg bg-emerald-600 px-4 py-3 text-white">Registrar recepción</Link><Link href="/dashboard/center/movements/delivery" className="rounded-lg bg-orange-500 px-4 py-3 text-white">Registrar entrega</Link><Link href="/dashboard/center/movements/merma" className="rounded-lg bg-rose-600 px-4 py-3 text-white">Registrar merma</Link><Link href="/dashboard/center/movements/transfer" className="rounded-lg bg-blue-600 px-4 py-3 text-white">Transferir</Link></div></div></AppShell>
  if (role === 'volunteer') {
    const volunteer = data.data
    return <AppShell title={title}><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><section className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Cuenta activa</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Hola, {volunteer?.name}</h2><p className="mt-2 text-slate-600">Tu cuenta está habilitada como voluntario para apoyar las operaciones del centro.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Correo</p><p className="mt-1 font-medium text-slate-900">{volunteer?.email}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Rol</p><p className="mt-1 font-medium text-slate-900">Voluntario</p></div></div></section><aside className="rounded-xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold text-amber-950">Registro QR</h2><p className="mt-2 text-sm text-amber-900">El registro QR está reservado exclusivamente para líderes de campaña. Solicita al coordinador que te asigne a un centro.</p></aside></div></AppShell>
  }
  return <AppShell title={title}><div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-slate-600">Consulta la información disponible para tu cuenta.</p></div></AppShell>
}
