// services/geocode.service.ts
import { prisma } from '@/lib/prisma'

interface Coordinates {
  lat: number
  lon: number
}

// Cola de geocodificación (1 request/segundo)
class GeocodeQueue {
  private queue: string[] = []
  private processing = false

  async add(address: string): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      this.queue.push(address)
      if (!this.processing) {
        this.processQueue(resolve)
      }
    })
  }

  private async processQueue(resolve: (value: Coordinates | null) => void) {
    this.processing = true

    while (this.queue.length > 0) {
      const address = this.queue.shift()!
      
      // Buscar en cache primero
      const cached = await prisma.geocodeCache.findUnique({
        where: { address }
      })

      if (cached) {
        resolve({ lat: cached.latitude, lon: cached.longitude })
        continue
      }

      // Llamar a Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          {
            headers: {
              'User-Agent': 'CentroAcopio/1.0'
            }
          }
        )

        const data = await response.json()

        if (data && data.length > 0) {
          const coords = {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          }

          // Guardar en cache
          await prisma.geocodeCache.create({
            data: {
              address,
              latitude: coords.lat,
              longitude: coords.lon
            }
          })

          resolve(coords)
        } else {
          resolve(null)
        }
      } catch (error) {
        console.error('Error geocoding:', address, error)
        resolve(null)
      }

      // Esperar 1 segundo (política de Nominatim)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    this.processing = false
  }
}

const geocodeQueue = new GeocodeQueue()

export class GeocodeService {
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    return await geocodeQueue.add(address)
  }

  static async geocodeCenters(centers: any[]) {
    const results = []

    for (const center of centers) {
      if (!center.latitude && center.location) {
        const coords = await this.geocodeAddress(center.location)
        if (coords) {
          results.push({
            id: center.id,
            ...coords
          })
        }
      }
    }

    return results
  }
}