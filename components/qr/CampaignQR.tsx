// components/qr/CampaignQR.tsx
'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QRService } from '@/services/qr.service'

interface CampaignQRProps {
  campaignId: string
  campaignName: string
}

export function CampaignQR({ campaignId, campaignName }: CampaignQRProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateQR = async () => {
    setLoading(true)
    try {
      const url = await QRService.generateQRUrl(campaignId)
      setQrUrl(url)
    } catch (error) {
      console.error('Error generando QR:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">🔗 Vinculación Rápida</h3>
        <p className="text-sm text-gray-600 mb-4">
          Genera un QR para "{campaignName}"
        </p>

        {!qrUrl ? (
          <button
            onClick={generateQR}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Generando...' : '📲 Generar Código QR'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <QRCodeSVG value={qrUrl} size={200} level="H" />
            </div>
            <button
              onClick={() => setQrUrl(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Regenerar QR
            </button>
          </div>
        )}
      </div>
    </div>
  )
}