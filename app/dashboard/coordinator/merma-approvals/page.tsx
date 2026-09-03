'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'

export default function MermaApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [error, setError] = useState('')
  const load = () => fetch('/api/merma-approvals').then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setRequests(result.data || []) }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Error de carga'))
  useEffect(() => { load() }, [])
  const decide = async (id: string, action: 'approve' | 'reject', campaignId?: string) => { const response = await fetch(`/api/merma-approvals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, campaignId }) }); if (!response.ok) { const result = await response.json(); setError(result.error || 'No se pudo procesar'); return } load() }
  const approve = (id: string) => { const campaignId = window.prompt('ID de la campaña'); if (campaignId) decide(id, 'approve', campaignId) }
  return <AppShell title="Aprobación de mermas">{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}{requests.length === 0 ? <div className="rounded-xl bg-white p-6">No hay solicitudes pendientes.</div> : <div className="space-y-3">{requests.map((request) => <article key={request.id} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{request.item.name} · {request.quantity}</h2><p className="text-sm text-slate-500">{request.reason} · {request.center.name}</p></div><div className="flex gap-2"><button onClick={() => decide(request.id, 'reject')} className="rounded-lg border border-red-300 px-3 py-2 text-red-700">Rechazar</button><button onClick={() => approve(request.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Aprobar</button></div></div></article>)}</div>}</AppShell>
}
