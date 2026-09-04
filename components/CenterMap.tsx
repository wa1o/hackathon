// components/map/CenterMap.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

interface CenterMapProps {
  centers: any[]
}

const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
const TILE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P'

function buildMarkerIcon(status: 'active' | 'inactive' | 'selected') {
  const palette = { active: '#dd9a34', inactive: '#94a3b8', selected: '#101c2c' }[status]
  return L.divIcon({
    className: 'center-marker',
    html: `
      <span style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;">
        ${
          status === 'active'
            ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${palette};opacity:0.35;animation:map-pulse 2s ease-out infinite;"></span>`
            : ''
        }
        <span style="position:relative;width:14px;height:14px;border-radius:9999px;background:${palette};border:2px solid white;box-shadow:0 1px 3px rgba(16,28,44,0.4);"></span>
      </span>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

function StockChart({ centerId }: { centerId: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/center?centerId=${centerId}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => setItems(result.data?.stockByItem || []))
      .finally(() => setLoading(false))
  }, [centerId])

  const max = Math.max(...items.map((item) => item.stock), 1)

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-[#726a5c]">Stock actual</h4>
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-600">Sin movimientos registrados.</p>
      ) : (
        items.slice(0, 6).map((item) => (
          <div key={item.id}>
            <div className="mb-1 flex justify-between text-xs text-slate-700">
              <span>{item.name}</span>
              <strong>{item.stock} {item.unit}</strong>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all ${item.isLow ? 'bg-[#c1666b]' : 'bg-[#dd9a34]'}`}
                style={{ width: `${Math.max(3, (item.stock / max) * 100)}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export function CenterMap({ centers }: CenterMapProps) {
  const [mapCenter] = useState<[number, number]>([19.4326, -99.1332])
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const visibleCenters = useMemo(
    () =>
      centers.filter((center) => {
        if (filter === 'active') return center.isActive
        if (filter === 'inactive') return !center.isActive
        return true
      }),
    [centers, filter]
  )

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg border border-gray-200">
      <style jsx global>{`
        @keyframes map-pulse {
          0% { transform: scale(0.6); opacity: 0.45; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(16, 28, 44, 0.18);
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 8px rgba(16, 28, 44, 0.12);
        }
      `}</style>

      <div className="absolute left-4 top-4 z-[1000] flex gap-1 rounded-full bg-white/95 p-1 shadow-md backdrop-blur">
        {(
          [
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Activos' },
            { key: 'inactive', label: 'Inactivos' },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === option.key ? 'bg-[#101c2c] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <MapContainer center={mapCenter} zoom={12} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ZoomControl position="bottomright" />

        {visibleCenters.map(
          (center) =>
            center.latitude &&
            center.longitude && (
              <Marker
                key={center.id}
                position={[center.latitude, center.longitude]}
                icon={buildMarkerIcon(
                  selectedCenter?.id === center.id ? 'selected' : center.isActive ? 'active' : 'inactive'
                )}
                eventHandlers={{ click: () => setSelectedCenter(center) }}
              >
                <Popup>
                  <div className="max-w-sm">
                    <h3 className="font-bold text-slate-900">{center.name}</h3>
                    <p className="text-sm text-slate-700">{center.institution}</p>
                    <p className="mt-1 text-sm text-slate-800">{center.location}</p>
                    <div className="mt-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          center.isActive ? 'bg-[#e9f3ea] text-[#3f6b46]' : 'bg-[#fbe7e0] text-[#8a3420]'
                        }`}
                      >
                        {center.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>

      {selectedCenter && (
        <aside className="absolute bottom-4 left-4 z-[1000] w-80 rounded-xl border border-slate-100 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">{selectedCenter.name}</h3>
              <p className="text-sm text-slate-700">{selectedCenter.institution}</p>
              <p className="mt-1 text-xs text-slate-600">{selectedCenter.address || selectedCenter.location}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCenter(null)}
              className="text-lg leading-none text-slate-400 hover:text-slate-700"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <StockChart centerId={selectedCenter.id} />
        </aside>
      )}
    </div>
  )
}