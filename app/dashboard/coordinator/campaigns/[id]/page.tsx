'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { AppShell } from '@/components/AppShell'

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [campaign, setCampaign] = useState<any>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { fetch(`/api/campaigns/${id}`, { cache: 'no-store' }).then((response) => response.json()).then((result) => { if (!result.success) throw new Error(result.error); setCampaign(result.data) }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Error de carga')) }, [id])
  const generateQR = async () => { const response = await fetch(`/api/campaigns/${id}/qr`, { method: 'POST' }); const result = await response.json(); if (!response.ok) { setError(result.error || 'No se pudo generar el QR'); return } setQrUrl(result.data.url) }
  if (error) return <AppShell title="Campaña"><p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p></AppShell>
  if (!campaign) return <AppShell title="Campaña"><p className="rounded-xl bg-white p-6">Cargando campaña...</p></AppShell>
  return <AppShell title={campaign.name}><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><section className="rounded-xl bg-white p-6 shadow-sm"><p className="text-slate-700">{campaign.description || 'Sin descripción'}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div><p className="text-xs uppercase text-slate-500">Inicio</p><strong>{new Date(campaign.startDate).toLocaleDateString()}</strong></div><div><p className="text-xs uppercase text-slate-500">Fin</p><strong>{new Date(campaign.endDate).toLocaleDateString()}</strong></div><div><p className="text-xs uppercase text-slate-500">Estado</p><strong>{campaign.isActive ? 'Activa' : 'Inactiva'}</strong></div></div><h2 className="mt-8 font-semibold">Metas</h2>{campaign.goals?.length ? campaign.goals.map((goal: any) => <div key={goal.id} className="mt-3 flex justify-between border-b py-3 text-slate-800"><span>{goal.item.name}</span><strong>{goal.currentQuantity} / {goal.targetQuantity}</strong></div>) : <p className="mt-3 text-sm text-slate-600">No hay metas registradas.</p>}</section><aside className="rounded-xl bg-slate-900 p-6 text-white"><h2 className="font-semibold">QR para líderes</h2><p className="mt-2 text-sm text-slate-300">Genera un código de un solo uso para unirse a esta campaña.</p><button onClick={generateQR} className="mt-5 w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950">{qrUrl ? 'Regenerar QR' : 'Generar QR'}</button>{qrUrl && <div className="mt-5 rounded-lg bg-white p-4 text-center"><QRCodeSVG value={qrUrl} size={220} className="mx-auto" /><p className="mt-3 break-all text-xs text-slate-700">{qrUrl}</p></div>}</aside></div></AppShell>
}
