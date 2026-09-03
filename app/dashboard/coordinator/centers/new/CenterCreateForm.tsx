'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DynamicLocationPicker } from '@/components/LocationPicker'

export default function CenterCreateForm() {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string>>({})
  const [point, setPoint] = useState<[number, number] | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    const response = await fetch('/api/centers', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, latitude: point?.[0], longitude: point?.[1] }) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'No se pudo crear el centro'); setSaving(false); return }
    router.push('/dashboard/coordinator/centers')
  }
  const fields = [['name', 'Nombre'], ['institution', 'Institución'], ['location', 'Ubicación'], ['address', 'Dirección'], ['phone', 'Teléfono'], ['schedule', 'Horario'], ['contactPerson', 'Persona de contacto']]
  return <form onSubmit={submit} className="max-w-3xl rounded-xl bg-white p-6 text-slate-900 shadow-sm"><h1 className="mb-6 text-2xl font-bold">Registrar centro</h1>{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}<div className="grid gap-4 md:grid-cols-2">{fields.map(([name, label]) => <label key={name} className="text-sm font-medium">{label}<input required={name === 'name' || name === 'institution' || name === 'location'} value={form[name] || ''} onChange={(event) => update(name, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900" /></label>)}</div><div className="mt-6"><h2 className="mb-2 font-semibold">Ubicación exacta</h2><DynamicLocationPicker value={point} onChange={setPoint} /></div><button disabled={saving} className="mt-6 rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Crear centro'}</button></form>
}
