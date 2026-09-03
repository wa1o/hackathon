'use client'

import dynamic from 'next/dynamic'

const CenterCreateForm = dynamic(() => import('./CenterCreateForm'), { ssr: false, loading: () => <p>Cargando formulario...</p> })

export default function NewCenterPage() {
  return <CenterCreateForm />
}
