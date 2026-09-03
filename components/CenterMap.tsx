// components/map/CenterMap.tsx
'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { iconConfig } from '@/lib/leaflet/config'

interface CenterMapProps {
  centers: any[]
}

function StockChart({ centerId }: { centerId: string }) {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    fetch(`/api/dashboard/center?centerId=${centerId}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => setItems(result.data?.stockByItem || []))
  }, [centerId])
  const max = Math.max(...items.map((item) => item.stock), 1)
  return <div className="mt-4 space-y-3"><h4 className="font-semibold text-slate-900">Stock actual</h4>{items.length === 0 ? <p className="text-sm text-slate-600">Sin movimientos registrados.</p> : items.slice(0, 6).map((item) => <div key={item.id}><div className="mb-1 flex justify-between text-xs text-slate-700"><span>{item.name}</span><strong>{item.stock} {item.unit}</strong></div><div className="h-2 rounded-full bg-slate-200"><div className={`h-2 rounded-full ${item.isLow ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${Math.max(3, (item.stock / max) * 100)}%` }} /></div></div>)}</div>
}

export function CenterMap({ centers }: CenterMapProps) {
  const [mapCenter] = useState<[number, number]>([19.4326, -99.1332])
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null)

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {centers.map((center) => (
          center.latitude && center.longitude && (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
              icon={iconConfig.default}
              eventHandlers={{ click: () => setSelectedCenter(center) }}
            >
              <Popup>
                <div className="max-w-sm">
                  <h3 className="font-bold text-slate-900">{center.name}</h3>
                  <p className="text-sm text-slate-700">{center.institution}</p>
                  <p className="mt-1 text-sm text-slate-800">{center.location}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      center.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {center.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      {selectedCenter && <aside className="absolute bottom-4 left-4 z-[1000] w-80 rounded-xl bg-white p-4 shadow-xl"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{selectedCenter.name}</h3><p className="text-sm text-slate-700">{selectedCenter.institution}</p><p className="mt-1 text-xs text-slate-600">{selectedCenter.address || selectedCenter.location}</p></div><button type="button" onClick={() => setSelectedCenter(null)} className="text-lg text-slate-700" aria-label="Cerrar">×</button></div><StockChart centerId={selectedCenter.id} /></aside>}
    </div>
  )
}