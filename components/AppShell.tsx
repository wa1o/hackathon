'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-slate-900">Centro de Ayuda</Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">{user?.name}</span>
            <button type="button" onClick={async () => { await logout(); router.replace('/login') }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Salir</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <nav className="h-fit rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
          {[
            ['Panel', `/dashboard/${user?.role === 'COORDINADOR' ? 'coordinator' : user?.role === 'ENCARGADO' ? 'center' : user?.role === 'LIDER_CAMPANA' ? 'campaign' : user?.role === 'INSTITUCION' ? 'institution' : 'volunteer'}`],
            ['Campañas', '/dashboard/coordinator/campaigns'],
            ['Centros', '/dashboard/coordinator/centers'],
            ['Artículos', '/dashboard/coordinator/items'],
            ['Mapa', '/dashboard/coordinator/map'],
            ['Aprobaciones', '/dashboard/coordinator/merma-approvals']
          ].map(([label, href]) => <Link key={href} href={href} className={`mb-1 block rounded-lg px-3 py-2 hover:bg-slate-800 ${pathname === href ? 'bg-cyan-500 text-slate-950' : ''}`}>{label}</Link>)}
        </nav>
        <main><h1 className="mb-6 text-3xl font-bold">{title}</h1>{children}</main>
      </div>
    </div>
  )
}
