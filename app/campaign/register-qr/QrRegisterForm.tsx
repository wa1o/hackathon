'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { QrScanner } from '@/components/QrScanner'

function extractToken(value: string) {
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed)
    const match = url.pathname.match(/\/campaign\/join\/([^/]+)$/)
    return match?.[1] || ''
  } catch {
    return trimmed.split('/').pop() || ''
  }
}

export default function QrRegisterForm() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const token = extractToken(value)
    if (!token) {
      setError('Introduce el enlace o código del QR.')
      return
    }
    setLoading(true)
    setError('')
    router.replace(`/campaign/join/${encodeURIComponent(token)}`)
  }

  const handleScan = (scannedValue: string) => {
    const token = extractToken(scannedValue)
    if (!token) {
      setError('El código escaneado no contiene un enlace de campaña válido.')
      return
    }
    setValue(scannedValue)
    setLoading(true)
    router.replace(`/campaign/join/${encodeURIComponent(token)}`)
  }

  return <AppShell title="Registrar código QR"><section className="max-w-xl rounded-xl bg-white p-6 shadow-sm"><p className="text-slate-700">Para acceder a tus campañas, registra primero el código QR que te entregó el coordinador.</p><QrScanner onScan={handleScan} /><div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />o pega el enlace<span className="h-px flex-1 bg-slate-200" /></div><form onSubmit={submit}><label htmlFor="qr-code" className="block text-sm font-semibold text-slate-900">Enlace del QR</label><input id="qr-code" value={value} onChange={(event) => setValue(event.target.value)} placeholder="https://.../campaign/join/..." className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-cyan-500" required />{error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}<button type="submit" disabled={loading} className="mt-5 rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Validando...' : 'Registrar QR'}</button></form></section></AppShell>
}
