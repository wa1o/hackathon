'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  useEffect(() => { fetch('/api/campaigns').then((response) => response.json()).then((result) => setCampaigns(result.data || [])) }, [])
  return <AppShell title="Campañas"><Link href="/dashboard/coordinator/campaigns/new" className="mb-5 inline-block rounded-lg bg-cyan-600 px-4 py-3 text-white">Nueva campaña</Link><div className="space-y-3">{campaigns.map((campaign) => <Link key={campaign.id} href={`/api/campaigns/${campaign.id}`} className="block rounded-xl bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="font-semibold">{campaign.name}</h2><span className="text-sm text-slate-500">{campaign.isActive ? 'Activa' : 'Inactiva'}</span></div><p className="mt-2 text-sm text-slate-500">{campaign.description || 'Sin descripción'}</p></Link>)}</div></AppShell>
}
