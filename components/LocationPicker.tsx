// components/map/LocationPicker.tsx
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { iconConfig } from '@/lib/leaflet/config'

const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
const TILE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P'

interface Suggestion {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function MapClick({ onPick }: { onPick: (point: [number, number]) => void }) {
  useMapEvents({ click: (event) => onPick([event.latlng.lat, event.latlng.lng]) })
  return null
}

function FlyTo({ point }: { point: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.flyTo(point, 16, { duration: 0.8 })
  }, [point, map])
  return null
}

function useAddressSearch(query: string) {
  const [results, setResults] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    setLoading(true)
    const timeout = setTimeout(() => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error('Location search failed')
          return response.json()
        })
        .then((result: { data: Suggestion[] }) => setResults(result.data || []))
        .catch((error) => {
          if (error.name !== 'AbortError') setResults([])
        })
        .finally(() => setLoading(false))
    }, 400)

    return () => clearTimeout(timeout)
  }, [query])

  return { results, loading }
}

export function LocationPicker({
  value,
  onChange,
  searchQuery = '',
}: {
  value: [number, number] | null
  onChange: (point: [number, number]) => void
  searchQuery?: string
}) {
  const [center] = useState<[number, number]>(value || [19.4326, -99.1332])
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [pickedLabel, setPickedLabel] = useState<string | null>(null)
  const previousSearchQuery = useRef(searchQuery)
  const { results, loading } = useAddressSearch(query)

  useEffect(() => {
    const nextQuery = searchQuery.trim()
    if (nextQuery !== previousSearchQuery.current) {
      previousSearchQuery.current = nextQuery
      setQuery(nextQuery)
      setPickedLabel(null)
      if (nextQuery.length >= 3) setFocused(true)
    }
  }, [searchQuery])

  function handleSelect(suggestion: Suggestion) {
    const point: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)]
    onChange(point)
    setFlyTarget(point)
    setPickedLabel(suggestion.display_name)
    setQuery(suggestion.display_name)
    setFocused(false)
  }

  function handleMapClick(point: [number, number]) {
    onChange(point)
    setPickedLabel(null)
    setQuery('')
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPickedLabel(null)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Busca una dirección o lugar…"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#dd9a34] focus:ring-2 focus:ring-[#dd9a34]/30"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-300 border-t-[#dd9a34]" />
        )}

        {focused && query.trim().length >= 3 && (
          <ul className="absolute z-[1100] mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {results.length === 0 && !loading && (
              <li className="px-4 py-3 text-sm text-slate-500">Sin coincidencias.</li>
            )}
            {results.map((suggestion) => (
              <li key={suggestion.place_id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(suggestion)}
                  className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {suggestion.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 h-72 overflow-hidden rounded-xl border border-slate-300">
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapClick onPick={handleMapClick} />
          <FlyTo point={flyTarget} />
          {value && <Marker position={value} icon={iconConfig.default} />}
        </MapContainer>
      </div>

      <p className="mt-2 text-sm text-slate-700">
        {pickedLabel
          ? pickedLabel
          : value
          ? `Ubicación seleccionada: ${value[0].toFixed(5)}, ${value[1].toFixed(5)}`
          : 'Escribe una dirección o haz clic en el mapa para fijar la ubicación exacta.'}
      </p>
    </div>
  )
}

export const DynamicLocationPicker = dynamic(() => Promise.resolve(LocationPicker), { ssr: false })