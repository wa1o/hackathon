'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'

type MovementType = 'reception' | 'delivery' | 'adjustment' | 'transfer' | 'merma'

export function MovementForm({ type }: { type: MovementType }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [values, setValues] = useState<Record<string, string>>({ quantity: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const responses = await Promise.all([
        fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/campaigns?isActive=true', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/items', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/centers?isActive=true', { credentials: 'same-origin', cache: 'no-store' })
      ])
      const results = await Promise.all(responses.map(async (response) => {
        const text = await response.text()
        let result: any = {}
        try { result = text ? JSON.parse(text) : {} } catch { throw new Error(`Respuesta inválida de ${response.url}`) }
        if (!response.ok) throw new Error(result.error || `Error ${response.status} en ${response.url}`)
        return result
      }))
      setUser(results[0].data)
      setCampaigns(results[1].data || [])
      setItems(results[2].data || [])
      setCenters(results[3].data || [])
    }
    load().catch((reason) => setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los catálogos'))
  }, [])

  const endpoint = `/api/movements/${type}`
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    const body: Record<string, string | number | undefined> = { ...values, quantity: Number(values.quantity), centerId: values.centerId || user?.managedCenter?.id }
    if (type === 'transfer') { body.originCenterId = values.originCenterId; body.targetCenterId = values.targetCenterId; delete body.centerId }
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'No se pudo registrar el movimiento'); setSaving(false); return }
    router.push('/dashboard/center')
  }

  return <AppShell title={`Registrar ${type}`}><form onSubmit={submit} className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}<label className="mb-4 block text-sm font-medium">Campaña<select required value={values.campaignId || ''} onChange={(event) => setValues({ ...values, campaignId: event.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Seleccionar</option>{campaigns.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="mb-4 block text-sm font-medium">Artículo<select required value={values.itemId || ''} onChange={(event) => setValues({ ...values, itemId: event.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Seleccionar</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select></label>{type === 'transfer' ? <><label className="mb-4 block text-sm font-medium">Centro origen<select required value={values.originCenterId || user?.managedCenter?.id || ''} onChange={(event) => setValues({ ...values, originCenterId: event.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Seleccionar</option>{centers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="mb-4 block text-sm font-medium">Centro destino<select required value={values.targetCenterId || ''} onChange={(event) => setValues({ ...values, targetCenterId: event.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Seleccionar</option>{centers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></> : <label className="mb-4 block text-sm font-medium">Centro<select required value={values.centerId || user?.managedCenter?.id || ''} onChange={(event) => setValues({ ...values, centerId: event.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Seleccionar</option>{centers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<label className="mb-4 block text-sm font-medium">Cantidad<input required min="0.01" step="0.01" type="number" value={values.quantity} onChange={(event) => setValues({ ...values, quantity: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label className="mb-5 block text-sm font-medium">Motivo<input required={type === 'adjustment' || type === 'merma'} value={values.reason || ''} onChange={(event) => setValues({ ...values, reason: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><button disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Registrar movimiento'}</button></form></AppShell>
}
