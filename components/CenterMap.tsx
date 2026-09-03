// components/map/CenterMap.tsx
'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { iconConfig } from '@/lib/leaflet/config'

interface CenterMapProps {
  centers: any[]
}

export function CenterMap({ centers }: CenterMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.4326, -99.1332])

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200">
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
            >
              <Popup>
                <div className="max-w-sm">
                  <h3 className="font-bold">{center.name}</h3>
                  <p className="text-sm text-gray-600">{center.institution}</p>
                  <p className="text-sm mt-1">{center.location}</p>
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
    </div>
  )
}