'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ResourceForm({ resource, endpoint, fields, title }: { resource: string; endpoint: string; fields: Array<{ name: string; label: string; type?: string }>; title: string }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar')
      router.push(resource)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Error de guardado') } finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="max-w-2xl rounded-xl bg-white p-6 shadow-sm"><h1 className="mb-6 text-2xl font-bold">{title}</h1>{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}{fields.map((field) => <label key={field.name} className="mb-4 block text-sm font-medium">{field.label}<input required={field.name !== 'description'} type={field.type || 'text'} value={values[field.name] || ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>)}<button disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button></form>
}
