'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'

interface CompanyRequest {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string | null
  message?: string | null
  createdAt: string
}

export default function CompanyRequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    try {
      const response = await fetch('/api/company-requests', { cache: 'no-store' })
      const text = await response.text()
      const result = text ? JSON.parse(text) : { error: 'El servidor devolvió una respuesta vacía.' }
      if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las solicitudes')
      setRequests(result.data || [])
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Error de carga') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const decide = async (id: string, decision: 'approve' | 'reject') => {
    const response = await fetch(`/api/company-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) })
    const text = await response.text()
    const result = text ? JSON.parse(text) : { error: 'El servidor devolvió una respuesta vacía.' }
    if (!response.ok) { setError(result.error || 'No se pudo procesar la solicitud'); return }
    await load()
  }
  return <AppShell title="Solicitudes de empresas">{loading ? <div className="rounded-xl bg-white p-6">Cargando solicitudes...</div> : requests.length === 0 ? <div className="rounded-xl bg-white p-6 text-slate-600">No hay solicitudes pendientes.</div> : <div className="space-y-4">{requests.map((request) => <article key={request.id} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-900">{request.companyName}</h2><p className="text-sm text-slate-700">{request.contactName} · {request.email}</p><p className="text-sm text-slate-600">{request.phone || 'Sin teléfono'}</p>{request.message && <p className="mt-3 max-w-2xl text-sm text-slate-700">{request.message}</p>}</div><div className="flex items-start gap-2"><button type="button" onClick={() => decide(request.id, 'reject')} className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700">Rechazar</button><button type="button" onClick={() => decide(request.id, 'approve')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">Autorizar</button></div></div></article>)}</div>}{error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-rose-700">{error}</p>}</AppShell>
}
