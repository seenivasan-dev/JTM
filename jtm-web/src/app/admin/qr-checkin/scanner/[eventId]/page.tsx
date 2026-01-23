'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Users, Baby, UtensilsCrossed, ArrowLeft } from 'lucide-react'

interface AttendeeInfo {
  id: string
  name: string
  email: string
  phone?: string
  adults: number
  kids: number
  alreadyCheckedIn: boolean
  checkedInAt?: string
  checkedInBy?: string
}

export default function QRScannerPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  
  const [scanning, setScanning] = useState(false)
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [eventInfo, setEventInfo] = useState<{title: string, date: string, location: string} | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    fetchEventInfo()
  }, [])

  const fetchEventInfo = async () => {
    try {
      const response = await fetch('/api/admin/qr-checkin/events/list')
      if (response.ok) {
        const data = await response.json()
        const event = data.events.find((e: any) => e.id === eventId)
        if (event) {
          setEventInfo({
            title: event.title,
            date: new Date(event.date).toLocaleDateString(),
            location: event.location
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch event info:', err)
    }
  }

  const startScanning = async () => {
    setError(null)
    setAttendeeInfo(null)
    
    try {
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader
      
      const videoInputDevices = await codeReader.listVideoInputDevices()
      if (videoInputDevices.length === 0) {
        setError('No camera found')
        return
      }

      // Prefer back camera on mobile
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      )?.deviceId || videoInputDevices[0].deviceId

      setScanning(true)

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result, error) => {
          if (result) {
            const qrData = result.getText()
            await verifyQRCode(qrData)
            stopScanning()
          }
        }
      )
    } catch (err) {
      setError('Failed to start camera')
      console.error(err)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setScanning(false)
  }

  const verifyQRCode = async (qrData: string) => {
    try {
      const response = await fetch('/api/admin/qr-checkin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, eventId })
      })

      const data = await response.json()

      if (response.ok) {
        setAttendeeInfo(data.attendee)
        setError(null)
      } else {
        setError(data.error || 'Invalid QR code')
        setAttendeeInfo(null)
      }
    } catch (err) {
      setError('Failed to verify QR code')
      console.error(err)
    }
  }

  const confirmCheckIn = async () => {
    if (!attendeeInfo) return

    setCheckingIn(true)
    try {
      const response = await fetch('/api/admin/qr-checkin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendeeId: attendeeInfo.id,
          eventId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Check-in confirmed!')
        // Navigate back to attendees list
        router.push('/admin/qr-checkin')
      } else {
        setError(data.error || 'Failed to check in')
      }
    } catch (err) {
      setError('Failed to confirm check-in')
      console.error(err)
    } finally {
      setCheckingIn(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const totalCoupons = attendeeInfo ? (attendeeInfo.adults + attendeeInfo.kids) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/qr-checkin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">QR Check-in Scanner</h1>
          {eventInfo && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900">{eventInfo.title}</p>
              <p className="text-sm text-blue-700">{eventInfo.date} • {eventInfo.location}</p>
            </div>
          )}
          <p className="text-gray-600 mt-2">Scan attendee QR codes to check them in</p>
        </div>

        {/* Scanner Section */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            {!scanning && !attendeeInfo && (
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400">
                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="mt-2">Ready to scan</p>
                  </div>
                </div>
                <Button
                  onClick={startScanning}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Start Scanning
                </Button>
              </div>
            )}

            {scanning && (
              <div className="space-y-4">
                <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ maxHeight: '400px', aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    autoPlay
                    muted
                    style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
                  />
                </div>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 text-lg">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <Button
                  onClick={() => {
                    setError(null)
                    startScanning()
                  }}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Attendee Info Display */}
        {attendeeInfo && (
          <Card className="p-6">
            {attendeeInfo.alreadyCheckedIn ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-900 text-xl">Already Checked In</h3>
                    <p className="text-yellow-700 mt-1">
                      Checked in at: {attendeeInfo.checkedInAt ? new Date(attendeeInfo.checkedInAt).toLocaleString() : 'Unknown'}
                    </p>
                    <p className="text-yellow-700">By: {attendeeInfo.checkedInBy || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-900 text-xl">Valid QR Code ✓</h3>
                    <p className="text-green-700 mt-1">Ready to check in</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attendee Details */}
            <div className="space-y-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{attendeeInfo.name}</h2>
                <p className="text-gray-600">{attendeeInfo.email}</p>
                {attendeeInfo.phone && <p className="text-gray-600">{attendeeInfo.phone}</p>}
              </div>
            </div>

            {/* FOOD COUPONS - PROMINENT DISPLAY */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-4 border-orange-400 rounded-2xl p-8 mb-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <UtensilsCrossed className="w-16 h-16 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-900 mb-3">FOOD COUPONS NEEDED</h3>
              <div className="text-8xl font-black text-orange-600 mb-4">
                {totalCoupons}
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-4xl font-bold text-blue-600">{attendeeInfo.adults}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Adult{attendeeInfo.adults !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                  <Baby className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-4xl font-bold text-green-600">{attendeeInfo.kids}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Kid{attendeeInfo.kids !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!attendeeInfo.alreadyCheckedIn && (
              <div className="space-y-3">
                <Button
                  onClick={confirmCheckIn}
                  disabled={checkingIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-xl font-bold"
                  size="lg"
                >
                  {checkingIn ? 'Checking In...' : `✓ Confirm Check-in & Give ${totalCoupons} Coupon${totalCoupons !== 1 ? 's' : ''}`}
                </Button>
                <Button
                  onClick={() => {
                    setAttendeeInfo(null)
                    startScanning()
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel & Scan Another
                </Button>
              </div>
            )}

            {attendeeInfo.alreadyCheckedIn && (
              <Button
                onClick={() => {
                  setAttendeeInfo(null)
                  startScanning()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Scan Another QR Code
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
