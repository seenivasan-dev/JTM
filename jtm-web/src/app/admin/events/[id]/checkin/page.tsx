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

export default async function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  
  return <CheckInPageClient eventId={eventId} />
}

function CheckInPageClient({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [processing, setProcessing] = useState(false)
  const [foodToken, setFoodToken] = useState(false)
  const [notes, setNotes] = useState('')
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

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
      if (!videoRef.current) {
        alert('Video element not ready')
        return
      }

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      const videoInputDevices = await codeReader.listVideoInputDevices()
      if (videoInputDevices.length === 0) {
        alert('No camera found')
        return
      }

      // Prefer back/rear camera on mobile devices
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )?.deviceId || videoInputDevices[videoInputDevices.length - 1]?.deviceId || videoInputDevices[0].deviceId

      setScanning(true)
      setScanResult(null)

      // Decode continuously from video device
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const qrData = result.getText()
            // Stop scanning temporarily while processing
            if (codeReaderRef.current) {
              codeReaderRef.current.reset()
            }
            setScanning(false)
            await handleQRScan(qrData)
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('QR scan error:', err)
          }
        }
      )
    } catch (error) {
      console.error('Start scanning error:', error)
      alert('Failed to start camera. Please ensure camera permissions are granted.')
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
    if (!scanResult?.rsvpResponseId) return

    setProcessing(true)

    try {
      const response = await fetch('/api/admin/checkin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rsvpResponseId: scanResult.rsvpResponseId,
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
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-y-auto">
      <div className="min-h-screen w-full p-3 sm:p-4 pb-20">
        {/* Mobile-optimized header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Event Check-In</h1>
          <p className="text-sm sm:text-base text-gray-600">Scan QR codes to check in attendees</p>
        </div>

        {/* QR Scanner - Mobile optimized */}
        <Card className="p-3 sm:p-6 mb-4">
          <div className="space-y-3">
            <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '80vh' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  display: 'block'
                }}
              />
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                  <div className="text-center text-white px-4">
                    <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-base sm:text-lg">Camera Ready</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2">Point at QR code to scan</p>
                  </div>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-blue-500 rounded-lg animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!scanning ? (
                <Button
                  onClick={startScanning}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-6"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="flex-1 text-base sm:text-lg py-6"
                >
                  Stop Scanning
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className="p-4 sm:p-6">
            {scanResult.success && scanResult.rsvp ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
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
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-4 sm:p-6 text-center">
                  <UtensilsCrossed className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-orange-600" />
                  <p className="text-xs sm:text-sm text-orange-700 font-medium mb-1">FOOD COUPONS NEEDED</p>
                  <p className="text-4xl sm:text-5xl font-bold text-orange-900">
                    {scanResult.rsvp.numberOfGuests + 1}
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    (1 person + {scanResult.rsvp.numberOfGuests} {scanResult.rsvp.numberOfGuests === 1 ? 'guest' : 'guests'})
                  </p>
                </div>

                {/* User Details */}
                <div className="grid gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <span className="break-all">{scanResult.rsvp.userEmail}</span>
                  </div>
                  {scanResult.rsvp.userPhone && (
                    <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      <span>{scanResult.rsvp.userPhone}</span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Event Information</h3>
                  <div className="grid gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                      <span>{new Date(scanResult.rsvp.eventDate).toLocaleDateString()} at {scanResult.rsvp.eventTime}</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
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
                  <div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          id="foodToken"
                          checked={foodToken}
                          onChange={(e) => setFoodToken(e.target.checked)}
                          className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 rounded"
                        />
                        <label htmlFor="foodToken" className="flex items-center gap-2 text-gray-900 cursor-pointer font-semibold text-sm sm:text-lg">
                          <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          <span>Food Coupons Given ({scanResult.rsvp.numberOfGuests + 1})</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        rows={2}
                        placeholder="Add any notes..."
                      />
                    </div>

                    <Button
                      onClick={handleCheckIn}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 text-base sm:text-lg py-6"
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
                  className="w-full text-base sm:text-lg py-6"
                >
                  Scan Another
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <XCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-red-500" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Invalid QR Code</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{scanResult.error}</p>
                <Button
                  onClick={() => setScanResult(null)}
                  variant="outline"
                  className="text-base sm:text-lg py-6"
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
