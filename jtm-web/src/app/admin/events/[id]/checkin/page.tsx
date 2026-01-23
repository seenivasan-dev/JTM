'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Camera, RotateCw, User, Mail, Phone, Calendar, MapPin, Users, UtensilsCrossed } from 'lucide-react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

interface RSVPDetails {
  id: string
  userName: string
  userEmail: string
  userPhone?: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  numberOfGuests: number
  dietaryRestrictions?: string
  specialRequests?: string
  responseStatus: string
}

interface ScanResult {
  success: boolean
  qrCodeId?: string
  alreadyCheckedIn: boolean
  checkInDetails?: {
    checkedInAt: string
    foodTokenGiven: boolean
  }
  rsvp?: RSVPDetails
  error?: string
}

export default function CheckInPage({ params }: { params: { id: string } }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [processing, setProcessing] = useState(false)
  const [foodToken, setFoodToken] = useState(false)
  const [notes, setNotes] = useState('')
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const eventId = params.id

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      const videoInputDevices = await codeReader.listVideoInputDevices()
      if (videoInputDevices.length === 0) {
        alert('No camera found')
        return
      }

      // Prefer back camera on mobile
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      )?.deviceId || videoInputDevices[0].deviceId

      setScanning(true)
      setScanResult(null)

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result, err) => {
          if (result) {
            const qrData = result.getText()
            await handleQRScan(qrData)
            codeReader.reset()
            setScanning(false)
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('QR scan error:', err)
          }
        }
      )
    } catch (error) {
      console.error('Start scanning error:', error)
      alert('Failed to start camera')
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setScanning(false)
  }

  const handleQRScan = async (qrData: string) => {
    setProcessing(true)

    try {
      const response = await fetch('/api/admin/checkin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setScanResult(data)
        setFoodToken(data.checkInDetails?.foodTokenGiven || false)
      } else {
        setScanResult({
          success: false,
          alreadyCheckedIn: false,
          error: data.error || 'Invalid QR code'
        })
      }
    } catch (error) {
      console.error('Scan error:', error)
      setScanResult({
        success: false,
        alreadyCheckedIn: false,
        error: 'Failed to process QR code'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckIn = async () => {
    if (!scanResult?.qrCodeId) return

    setProcessing(true)

    try {
      const response = await fetch('/api/admin/checkin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: scanResult.qrCodeId,
          eventId: eventId,
          foodTokenGiven: foodToken,
          notes: notes
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Check-in successful!')
        setScanResult(null)
        setNotes('')
        setFoodToken(false)
      } else {
        alert(`Check-in failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Check-in error:', error)
      alert('Failed to complete check-in')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Check-In</h1>
          <p className="text-gray-600">Scan QR codes to check in attendees</p>
        </div>

        {/* QR Scanner */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera Ready</p>
                  </div>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-blue-500 rounded-lg animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!scanning ? (
                <Button
                  onClick={startScanning}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Stop Scanning
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className="p-6">
            {scanResult.success && scanResult.rsvp ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {scanResult.rsvp.userName}
                    </h2>
                    {scanResult.alreadyCheckedIn ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Already Checked In
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        Ready to Check In
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Food Coupon Count - Prominent Display */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-6 text-center">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm text-orange-700 font-medium mb-1">FOOD COUPONS NEEDED</p>
                  <p className="text-5xl font-bold text-orange-900">
                    {scanResult.rsvp.numberOfGuests + 1}
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    (1 person + {scanResult.rsvp.numberOfGuests} {scanResult.rsvp.numberOfGuests === 1 ? 'guest' : 'guests'})
                  </p>
                </div>

                {/* User Details */}
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>{scanResult.rsvp.userEmail}</span>
                  </div>
                  {scanResult.rsvp.userPhone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>{scanResult.rsvp.userPhone}</span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Event Information</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span>{new Date(scanResult.rsvp.eventDate).toLocaleDateString()} at {scanResult.rsvp.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span>{scanResult.rsvp.eventLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(scanResult.rsvp.dietaryRestrictions || scanResult.rsvp.specialRequests) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                    {scanResult.rsvp.dietaryRestrictions && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Dietary Restrictions:</span>
                        <p className="text-gray-600">{scanResult.rsvp.dietaryRestrictions}</p>
                      </div>
                    )}
                    {scanResult.rsvp.specialRequests && (
                      <div>
                        <span className="font-medium text-gray-700">Special Requests:</span>
                        <p className="text-gray-600">{scanResult.rsvp.specialRequests}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Check-in Actions */}
                {!scanResult.alreadyCheckedIn && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="foodToken"
                          checked={foodToken}
                          onChange={(e) => setFoodToken(e.target.checked)}
                          className="w-6 h-6 text-green-600 rounded"
                        />
                        <label htmlFor="foodToken" className="flex items-center gap-2 text-gray-900 cursor-pointer font-semibold text-lg">
                          <UtensilsCrossed className="w-6 h-6 text-green-600" />
                          <span>Food Coupons Given ({scanResult.rsvp.numberOfGuests + 1} coupons)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Add any notes..."
                      />
                    </div>

                    <Button
                      onClick={handleCheckIn}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <RotateCw className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Confirm Check-In
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {scanResult.alreadyCheckedIn && scanResult.checkInDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Already Checked In</span>
                    </div>
                    <p className="text-green-800 mb-2">
                      {new Date(scanResult.checkInDetails.checkedInAt).toLocaleString()}
                    </p>
                    {scanResult.checkInDetails.foodTokenGiven ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <UtensilsCrossed className="w-5 h-5" />
                        <span className="font-semibold">Food coupons given ({scanResult.rsvp.numberOfGuests + 1} coupons)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">Food coupons NOT given yet</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => {
                    setScanResult(null)
                    setNotes('')
                    setFoodToken(false)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Scan Another
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid QR Code</h3>
                <p className="text-gray-600 mb-6">{scanResult.error}</p>
                <Button
                  onClick={() => setScanResult(null)}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
