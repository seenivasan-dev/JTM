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
      // Simulate successful scan - in real implementation, this would come from QR scanner
      const mockQRData = "JTM-EVENT:12345:67890:1234567890"
      handleQRScan(mockQRData)
    }, 3000)
  }

  const handleQRScan = async (qrData: string) => {
    try {
      // Parse QR code data (format: JTM-EVENT:eventId:userId:timestamp)
      const parts = qrData.split(':')
      if (parts.length !== 4 || parts[0] !== 'JTM-EVENT') {
        setScanResult({
          success: false,
          message: 'Invalid QR code format'
        })
        return
      }

      const [, eventId, userId] = parts

      const response = await fetch('/api/events/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          qrCode: qrData,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setScanResult({
          success: true,
          message: 'Check-in successful!',
          attendee: {
            name: result.attendee?.name || 'Unknown',
            email: result.attendee?.email || 'unknown@email.com'
          }
        })
      } else {
        setScanResult({
          success: false,
          message: result.error || 'Check-in failed'
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Error processing QR code'
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
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            {scanning ? (
              <div className="text-center">
                <Scan className="h-12 w-12 mx-auto mb-4 animate-pulse text-blue-500" />
                <p className="text-lg font-medium">Scanning...</p>
                <p className="text-sm text-muted-foreground">Point camera at QR code</p>
              </div>
            ) : (
              <div className="text-center">
                <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Ready to Scan</p>
                <Button onClick={handleStartScan} size="lg">
                  <Scan className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            )}
          </div>
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
            <div className="font-medium">{scanResult.message}</div>
            {scanResult.attendee && (
              <div className="mt-2 text-sm">
                <p><strong>Name:</strong> {scanResult.attendee.name}</p>
                <p><strong>Email:</strong> {scanResult.attendee.email}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
          <CardDescription>
            Development roadmap for QR scanner functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
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