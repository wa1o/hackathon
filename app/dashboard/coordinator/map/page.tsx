'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'

const CenterMap = dynamic(() => import('@/components/CenterMap').then((module) => module.CenterMap), { ssr: false, loading: () => <p className="rounded-xl bg-white p-6">Cargando mapa...</p> })

export default function MapPage() {
  const [centers, setCenters] = useState<any[]>([])
  useEffect(() => { fetch('/api/centers?isActive=true').then((response) => response.json()).then((result) => setCenters(result.data || [])) }, [])
  return <AppShell title="Mapa de centros"><CenterMap centers={centers} /></AppShell>
}
