'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import jsQR from 'jsqr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  QrCode,
  Scan,
  UserCheck,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera,
  CameraOff
} from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  date: string
  location: string
}

interface QRScannerClientProps {
  event?: Event | null
}

export default function QRScannerClient({ event }: QRScannerClientProps) {
  const [scanning, setScanning] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const webcamRef = useRef<Webcam>(null)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    attendee?: {
      name: string
      email: string
    }
    alreadyCheckedIn?: boolean
  } | null>(null)

  // Check camera permissions
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setHasPermission(true)
      } catch (error) {
        setHasPermission(false)
        setCameraError('Camera permission denied or camera not available')
      }
    }

    if (scanning) {
      checkCameraPermission()
    }
  }, [scanning])

  // QR Code scanning logic
  const scanQRCode = useCallback(() => {
    if (!webcamRef.current) return

    const video = webcamRef.current.video
    if (!video) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      handleQRScan(code.data)
      setScanning(false)
    }
  }, [])

  // Continuously scan for QR codes when camera is active
  useEffect(() => {
    if (!scanning || !hasPermission) return

    const interval = setInterval(scanQRCode, 250)
    return () => clearInterval(interval)
  }, [scanning, hasPermission, scanQRCode])

  const handleStartScan = () => {
    setScanning(true)
    setScanResult(null)
    setCameraError(null)
  }

  const handleStopScan = () => {
    setScanning(false)
    setCameraError(null)
  }

  const handleQRScan = async (qrData: string) => {
    try {
      // Parse QR code data (format: JTM-EVENT:eventId:userId:timestamp)
      const parts = qrData.split(':')
      if (parts.length !== 4 || parts[0] !== 'JTM-EVENT') {
        setScanResult({
          success: false,
          message: 'Invalid QR code format. Please ensure this is a valid JTM event QR code.'
        })
        return
      }

      const [, scannedEventId, userId] = parts

      // If we have a specific event, verify the QR code is for this event
      if (event && event.id !== scannedEventId) {
        setScanResult({
          success: false,
          message: `This QR code is for a different event. Expected: ${event.title}`
        })
        return
      }

      const response = await fetch('/api/events/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event?.id || scannedEventId,
          qrCode: qrData,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setScanResult({
          success: true,
          message: result.alreadyCheckedIn ? 'Already checked in!' : 'Check-in successful!',
          attendee: {
            name: `${result.rsvp?.user?.firstName} ${result.rsvp?.user?.lastName}`.trim() || 'Unknown',
            email: result.rsvp?.user?.email || 'unknown@email.com'
          },
          alreadyCheckedIn: result.alreadyCheckedIn
        })
      } else {
        setScanResult({
          success: false,
          message: result.error || 'Check-in failed'
        })
      }
    } catch (error) {
      console.error('QR scan error:', error)
      setScanResult({
        success: false,
        message: 'Error processing QR code. Please try again.'
      })
    }
  }

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualEmail) {
      setScanResult({
        success: false,
        message: 'Please enter an email address'
      })
      return
    }

    try {
      const response = await fetch('/api/events/checkin/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event?.id,
          email: manualEmail,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setScanResult({
          success: true,
          message: result.alreadyCheckedIn ? 'Already checked in!' : 'Manual check-in successful!',
          attendee: {
            name: `${result.rsvp?.user?.firstName} ${result.rsvp?.user?.lastName}`.trim() || 'Unknown',
            email: result.rsvp?.user?.email || manualEmail
          },
          alreadyCheckedIn: result.alreadyCheckedIn
        })
        setManualEmail('')
      } else {
        setScanResult({
          success: false,
          message: result.error || 'Manual check-in failed'
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Error during manual check-in. Please try again.'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        
        {event && (
          <div className="text-right">
            <h1 className="text-xl font-semibold">{event.title}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(event.date).toLocaleDateString()} • {event.location}
            </p>
          </div>
        )}
      </div>

      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan QR codes to check in attendees for the event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPermission && scanning ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
              <CameraOff className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium text-red-700 mb-2">Camera Access Required</p>
              <p className="text-sm text-red-600 text-center mb-4">
                Please allow camera access to scan QR codes. Check your browser settings and reload the page.
              </p>
              <Button onClick={handleStopScan} variant="outline">
                Close Camera
              </Button>
            </div>
          ) : scanning ? (
            <div className="space-y-4">
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: { ideal: "environment" },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    advanced: [{ focusMode: "continuous" }] as any
                  }}
                  className="w-full rounded-lg"
                  onUserMediaError={(error) => {
                    console.error('Camera error:', error)
                    setCameraError('Failed to access camera')
                    setScanning(false)
                  }}
                />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Position QR code within the frame</p>
                <Button onClick={handleStopScan} variant="outline">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Ready to Scan</p>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Click to start scanning QR codes for event check-in
              </p>
              <Button onClick={handleStartScan} size="lg">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {cameraError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {cameraError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Manual Check-In */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Manual Check-In
          </CardTitle>
          <CardDescription>
            Manually check in attendees by email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualCheckIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter attendee email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Check In Attendee
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scan Result */}
      {scanResult && (
        <Alert className={scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {scanResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <div className={`font-medium ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {scanResult.message}
            </div>
            {scanResult.attendee && (
              <div className="mt-2 text-sm">
                <p><strong>Name:</strong> {scanResult.attendee.name}</p>
                <p><strong>Email:</strong> {scanResult.attendee.email}</p>
                {scanResult.alreadyCheckedIn && (
                  <p className="text-yellow-600 font-medium mt-1">
                    ⚠️ This attendee was already checked in
                  </p>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      {event && (
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Event</p>
                <p>{event.title}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Date</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Location</p>
                <p>{event.location}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <p className="text-green-600">Ready for Check-in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}