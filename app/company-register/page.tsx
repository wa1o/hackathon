'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'

export default function CompanyRegisterPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await fetch('/api/company-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la solicitud')
      setSent(true)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Error de envío') } finally { setLoading(false) }
  }
  if (sent) return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white"><section className="w-full max-w-lg rounded-2xl bg-slate-900 p-8 text-center"><h1 className="text-3xl font-bold">Solicitud recibida</h1><p className="mt-3 text-slate-300">El coordinador revisará los datos y autorizará tu cuenta si todo está correcto.</p><Link href="/login" className="mt-6 inline-block rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Ir al acceso</Link></section></main>
  const fields = [['companyName', 'Nombre de la empresa'], ['contactName', 'Persona de contacto'], ['email', 'Correo corporativo'], ['phone', 'Teléfono'], ['password', 'Contraseña para la cuenta']]
  return <main className="min-h-screen bg-slate-950 px-6 py-12 text-white"><div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[.9fr_1.1fr]"><section><p className="text-sm font-semibold uppercase tracking-[.2em] text-cyan-400">Colaboración empresarial</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Registra tu empresa para colaborar.</h1><p className="mt-4 max-w-md text-slate-300">Envía tus datos. Tu cuenta se creará únicamente después de la autorización del coordinador.</p></section><form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><h2 className="text-2xl font-bold">Solicitar registro</h2>{error && <p role="alert" className="mt-4 rounded-lg bg-rose-950 p-3 text-rose-300">{error}</p>}{fields.map(([name, label]) => <label key={name} className="mt-4 block text-sm font-medium">{label}<input required={name !== 'phone'} type={name === 'email' ? 'email' : name === 'password' ? 'password' : 'text'} value={form[name] || ''} onChange={(event) => update(name, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" /></label>)}<label className="mt-4 block text-sm font-medium">Mensaje (opcional)<textarea value={form.message || ''} onChange={(event) => update('message', event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" /></label><button disabled={loading} className="mt-6 w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar solicitud'}</button></form></div></main>
}
