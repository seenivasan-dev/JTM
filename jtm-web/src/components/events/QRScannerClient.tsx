'use client'

import React, { useState } from 'react'
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
  AlertCircle
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
  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    attendee?: {
      name: string
      email: string
    }
  } | null>(null)

  const handleStartScan = () => {
    setScanning(true)
    // TODO: Implement actual QR code scanning
    // This would use a camera library like react-webcam or similar
    
    // Simulate scanning for now
    setTimeout(() => {
      setScanning(false)
      setScanResult({
        success: true,
        message: 'QR code scanned successfully!',
        attendee: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      })
    }, 3000)
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

    // TODO: Implement manual check-in API call
    try {
      // Mock API call
      setScanResult({
        success: true,
        message: 'Manual check-in successful!',
        attendee: {
          name: 'Jane Doe',
          email: manualEmail
        }
      })
      setManualEmail('')
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Failed to check in attendee'
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
      </div>

      {/* Event Info */}
      {event && (
        <Card>
          <CardHeader>
            <CardTitle>Event Check-In</CardTitle>
            <CardDescription>
              Scanning for: {event.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
              <div><strong>Location:</strong> {event.location}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Interface */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Scan attendee QR codes for automatic check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scanner Area */}
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                {scanning ? (
                  <div className="text-center">
                    <div className="animate-pulse">
                      <Scan className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                    </div>
                    <p className="text-sm text-gray-600">Scanning for QR code...</p>
                    <p className="text-xs text-gray-400 mt-2">Position QR code in view</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">Click to start scanning</p>
                  </div>
                )}
              </div>
              
              {/* Scanner Corners */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-blue-500"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-blue-500"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-blue-500"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-blue-500"></div>
            </div>

            <Button 
              onClick={handleStartScan} 
              disabled={scanning}
              className="w-full"
            >
              {scanning ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Start QR Scan
                </>
              )}
            </Button>
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
              Manually check in attendees using their email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Attendee Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="Enter attendee email address"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                <UserCheck className="h-4 w-4 mr-2" />
                Check In Attendee
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <Alert className={scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {scanResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={scanResult.success ? 'text-green-800' : 'text-red-800'}>
            <div className="font-medium">{scanResult.message}</div>
            {scanResult.attendee && (
              <div className="mt-2 text-sm">
                <div><strong>Name:</strong> {scanResult.attendee.name}</div>
                <div><strong>Email:</strong> {scanResult.attendee.email}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Camera Integration:</strong> Implement with react-webcam or similar library for QR code scanning
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>QR Code Validation:</strong> Verify QR codes contain valid event and user data with security hash
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Offline Support:</strong> Cache scans locally and sync when connection is restored
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Duplicate Prevention:</strong> Check if attendee is already checked in before processing
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Real-time Updates:</strong> Update attendance counts and display live statistics
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}