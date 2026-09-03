'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/AppShell'

export default function CenterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [center, setCenter] = useState<any>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([fetch(`/api/centers/${id}`), fetch(`/api/dashboard/center?centerId=${id}`)]).then(async ([centerResponse, dashboardResponse]) => {
      const centerResult = await centerResponse.json()
      const dashboardResult = await dashboardResponse.json()
      if (!centerResponse.ok) throw new Error(centerResult.error)
      setCenter(centerResult.data)
      setDashboard(dashboardResult.data)
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Error de carga'))
  }, [id])
  if (error) return <AppShell title="Centro"><p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p></AppShell>
  if (!center) return <AppShell title="Centro"><p className="rounded-xl bg-white p-6">Cargando centro...</p></AppShell>
  const stock = dashboard?.stockByItem || []
  const max = Math.max(...stock.map((item: any) => item.stock), 1)
  return <AppShell title={center.name}><section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">{center.institution}</h2><p className="mt-2 text-slate-700">{center.address || center.location}</p><p className="mt-1 text-sm text-slate-600">{center.phone || 'Sin teléfono'} · {center.schedule || 'Horario no registrado'}</p><h3 className="mt-8 font-semibold text-slate-900">Stock por artículo</h3><div className="mt-4 space-y-4">{stock.map((item: any) => <div key={item.id}><div className="flex justify-between text-sm text-slate-800"><span>{item.name}</span><strong>{item.stock} {item.unit}</strong></div><div className="mt-1 h-3 rounded-full bg-slate-200"><div className={`h-3 rounded-full ${item.isLow ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${Math.max(3, item.stock / max * 100)}%` }} /></div></div>)}</div></section></AppShell>
}
