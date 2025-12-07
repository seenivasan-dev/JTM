'use client'

// QR Code Display Component
import { useEffect, useState } from 'react'
import { QrCode } from 'lucide-react'

interface QRCodeDisplayProps {
  data: string
  size?: number
  className?: string
}

export function QRCodeDisplay({ data, size = 250, className = '' }: QRCodeDisplayProps) {
  const [qrCodeImage, setQRCodeImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function generateQRCode() {
      try {
        setLoading(true)
        setError(false)
        
        // Dynamic import to avoid SSR issues
        const QRCode = (await import('qrcode')).default
        
        const qrDataURL = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#10b981', // Green
            light: '#FFFFFF',
          },
        })
        
        setQRCodeImage(qrDataURL)
      } catch (err) {
        console.error('Failed to generate QR code:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (data) {
      generateQRCode()
    }
  }, [data, size])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="text-center">
          <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400 animate-pulse" />
          <p className="text-xs text-gray-500">Generating QR Code...</p>
        </div>
      </div>
    )
  }

  if (error || !qrCodeImage) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="text-center p-4">
          <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-500 mb-2">QR Code for Event Check-in</p>
          <div className="text-xs font-mono break-all bg-gray-50 p-2 rounded border max-w-full overflow-hidden">
            {data}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <img 
        src={qrCodeImage} 
        alt="Event QR Code" 
        className="rounded-lg border-2 border-green-500"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
