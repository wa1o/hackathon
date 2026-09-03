'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([])
  useEffect(() => { fetch('/api/centers?isActive=true').then((response) => response.json()).then((result) => setCenters(result.data || [])) }, [])
  return <AppShell title="Centros"><Link href="/dashboard/coordinator/centers/new" className="mb-5 inline-block rounded-lg bg-cyan-600 px-4 py-3 text-white">Nuevo centro</Link><div className="grid gap-4 md:grid-cols-2">{centers.map((center) => <Link key={center.id} href={`/api/centers/${center.id}`} className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">{center.name}</h2><p className="text-sm text-slate-500">{center.institution}</p><p className="mt-2 text-sm">{center.location}</p></Link>)}</div></AppShell>
}
