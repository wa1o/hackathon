'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')

  const stop = async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
      scannerRef.current.clear()
    } catch {
      // The scanner may already be stopped when the component unmounts.
    }
    scannerRef.current = null
    setActive(false)
  }

  const start = async () => {
    setError('')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stop()
          onScan(decodedText)
        },
        () => undefined
      )
      setActive(true)
    } catch {
      scannerRef.current = null
      setError('No se pudo activar la cámara. Revisa el permiso del navegador o pega el enlace manualmente.')
    }
  }

  useEffect(() => () => { void stop() }, [])

  return <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><div id="qr-reader" className="overflow-hidden rounded-lg" />{error && <p className="mt-3 text-sm text-rose-600">{error}</p>}<button type="button" onClick={() => active ? stop() : start()} className="mt-4 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white">{active ? 'Detener cámara' : 'Escanear QR con cámara'}</button></div>
}
