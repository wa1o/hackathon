'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'No fue posible iniciar sesión')
      }

      const role = result.data?.user?.role
      const destination = {
        COORDINADOR: '/dashboard/coordinator',
        ENCARGADO: '/dashboard/center',
        LIDER_CAMPANA: '/dashboard/campaign',
        INSTITUCION: '/dashboard/institution'
      }[role as string] || '/dashboard/volunteer'

      router.push(destination)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Centro de ayuda</p>
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-slate-400">Accede a la gestión de campañas y donaciones.</p>

          <label className="mt-8 block text-sm font-medium" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
          />

          <label className="mt-5 block text-sm font-medium" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
          />

          {error && <p role="alert" className="mt-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
