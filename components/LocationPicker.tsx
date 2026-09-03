'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { iconConfig } from '@/lib/leaflet/config'

function MapClick({ onPick }: { onPick: (point: [number, number]) => void }) {
  useMapEvents({ click: (event) => onPick([event.latlng.lat, event.latlng.lng]) })
  return null
}

export function LocationPicker({ value, onChange }: { value: [number, number] | null; onChange: (point: [number, number]) => void }) {
  const [center] = useState<[number, number]>(value || [19.4326, -99.1332])
  return <div><div className="h-72 overflow-hidden rounded-xl border border-slate-300"><MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" /><MapClick onPick={onChange} />{value && <Marker position={value} icon={iconConfig.default} />}</MapContainer></div><p className="mt-2 text-sm text-slate-700">{value ? `Ubicación seleccionada: ${value[0].toFixed(5)}, ${value[1].toFixed(5)}` : 'Haz clic en el mapa para fijar la ubicación exacta.'}</p></div>
}

export const DynamicLocationPicker = dynamic(() => Promise.resolve(LocationPicker), { ssr: false })
