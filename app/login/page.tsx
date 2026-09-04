'use client'

import { FormEvent, useState } from 'react'
import { Fraunces, Public_Sans } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      const next = new URLSearchParams(window.location.search).get('next')
      const role = user.role
      if (role === 'LIDER_CAMPANA' && !user.campaignsLed?.length) {
        window.location.replace('/campaign/register-qr')
        return
      }
      if (next && next.startsWith('/')) {
        window.location.replace(next)
        return
      }
      const destination = {
        COORDINADOR: '/dashboard/coordinator',
        ENCARGADO: '/dashboard/center',
        LIDER_CAMPANA: '/dashboard/campaign',
        INSTITUCION: '/dashboard/institution'
      }[role as string] || '/dashboard/volunteer'

      window.location.replace(destination)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`${publicSans.className} min-h-screen bg-[#f7f3ec] lg:grid lg:grid-cols-[1.1fr_1fr]`}>
      {/* Panel de contexto */}
      <section className="relative overflow-hidden bg-[#101c2c] px-6 py-10 text-[#eef2f6] sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-14 lg:py-16">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#dd9a34] text-sm font-bold text-[#101c2c]">
              CA
            </span>
            <span className="text-sm font-medium text-[#93a7bd]">Centro de Acopio</span>
          </div>

          <h1 className={`${fraunces.className} mt-6 max-w-md text-3xl leading-tight text-[#eef2f6] sm:text-4xl lg:mt-12 lg:text-[2.75rem]`}>
            Coordina donaciones, centro por centro.
          </h1>
          <p className="mt-4 max-w-sm text-[#93a7bd]">
            Cada entrada, salida y traslado queda registrado para que los albergues reciban lo que necesitan a tiempo.
          </p>
        </div>

        <ul className="relative z-10 mt-10 hidden space-y-4 lg:block">
          <li className="flex items-start gap-3 text-sm text-[#c7d3e0]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dd9a34]" />
            Stock calculado en tiempo real a partir de cada movimiento
          </li>
          <li className="flex items-start gap-3 text-sm text-[#c7d3e0]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dd9a34]" />
            Mapa interactivo de centros activos
          </li>
          <li className="flex items-start gap-3 text-sm text-[#c7d3e0]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dd9a34]" />
            Código QR para vincular líderes a su campaña
          </li>
        </ul>

        {/* Ilustración: ruta entre centros, decorativa y ligera */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 opacity-40 lg:h-96 lg:w-96"
        >
          <path
            d="M40 320 C 120 260, 140 180, 220 160 S 340 100, 360 40"
            fill="none"
            stroke="#dd9a34"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
          <circle cx="40" cy="320" r="5" fill="#dd9a34" />
          <circle cx="220" cy="160" r="5" fill="#eef2f6" />
          <circle cx="360" cy="40" r="5" fill="#dd9a34" />
        </svg>
      </section>

      {/* Panel de formulario */}
      <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className={`${fraunces.className} text-2xl text-[#1c2530]`}>Inicia sesión</h2>
          <p className="mt-1 text-sm text-[#726a5c]">Accede con tu correo institucional.</p>

          <div className="mt-8">
            <label className="block text-sm font-medium text-[#1c2530]" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-[#ddd3c2] bg-white px-4 py-3 text-[#1c2530] outline-none transition focus:border-[#dd9a34] focus:ring-2 focus:ring-[#dd9a34]/30"
            />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-[#1c2530]" htmlFor="password">
              Contraseña
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-[#ddd3c2] bg-white px-4 py-3 pr-12 text-[#1c2530] outline-none transition focus:border-[#dd9a34] focus:ring-2 focus:ring-[#dd9a34]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#726a5c] hover:text-[#1c2530]"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 003.5 3.5M6.5 6.7C4.3 8.2 2.7 10.2 2 12c1.6 3.8 5.5 7 10 7 1.6 0 3.1-.4 4.4-1.1M9.9 4.2A10.6 10.6 0 0112 4c4.5 0 8.4 3.2 10 7-.5 1.2-1.2 2.4-2.1 3.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12c1.6-3.8 5.5-7 10-7s8.4 3.2 10 7c-1.6 3.8-5.5 7-10 7s-8.4-3.2-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md bg-[#fbe7e0] px-4 py-3 text-sm text-[#8a3420]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-md bg-[#dd9a34] px-4 py-3 font-semibold text-[#101c2c] transition hover:bg-[#c8862a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Validando…' : 'Entrar'}
          </button>

          <p className="mt-6 text-center text-sm text-[#726a5c]">
            ¿No tienes acceso? Contacta a tu coordinador de campaña.
          </p>
          <a href="/company-register" className="mt-3 block text-center text-sm font-medium text-[#b56f18] hover:underline">
            ¿Representas una empresa? Solicita tu registro
          </a>
        </form>
      </section>
    </main>
  )
}