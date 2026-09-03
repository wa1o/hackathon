'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const load = () => fetch('/api/items').then((response) => response.json()).then((result) => setItems(result.data || []))
  useEffect(() => { load() }, [])
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setError('')
    const response = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (!response.ok) { const result = await response.json(); setError(result.error || 'No se pudo crear'); return }
    setName(''); load()
  }
  return <AppShell title="Artículos"><form onSubmit={create} className="mb-6 flex gap-2"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nuevo artículo" className="flex-1 rounded-lg border px-3 py-2" /><button className="rounded-lg bg-cyan-600 px-4 py-2 text-white">Añadir</button></form>{error && <p className="mb-4 text-red-600">{error}</p>}<div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <Link key={item.id} href={`/dashboard/coordinator/items/${item.id}`} className="rounded-xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-cyan-400"><strong>{item.name}</strong><p className="text-sm text-slate-500">{item.category} · {item.unit}</p></Link>)}</div></AppShell>
}
