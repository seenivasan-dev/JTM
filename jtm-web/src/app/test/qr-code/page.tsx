// JTM Web - QR Code Test Page
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, CheckCircle, Copy } from 'lucide-react'

export default function QRCodeTestPage() {
  const [testQRCode, setTestQRCode] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Generate a test QR code
  const generateTestQRCode = () => {
    // Format: JTM-EVENT:eventId:userId:timestamp
    const mockEventId = 'evt_123456789'
    const mockUserId = 'usr_987654321'
    const timestamp = Date.now()
    const qrCode = `JTM-EVENT:${mockEventId}:${mockUserId}:${timestamp}`
    setTestQRCode(qrCode)
  }

  const copyToClipboard = async () => {
    if (testQRCode) {
      await navigator.clipboard.writeText(testQRCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">QR Code System Test</h1>
        <p className="text-gray-600">
          Test the complete QR code workflow for event check-ins
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Test QR Code Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Generation
            </CardTitle>
            <CardDescription>
              Simulate a member's QR code after payment confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={generateTestQRCode} className="w-full">
              Generate Test QR Code
            </Button>
            
            {testQRCode && (
              <div className="space-y-3">
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-green-300">
                  <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center border rounded-lg mb-4">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 mb-2">Member's QR Code</p>
                      <div className="text-xs font-mono break-all bg-gray-50 p-2 rounded border max-w-full overflow-hidden">
                        {testQRCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </div>
                
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <strong>QR Code Generated!</strong><br />
                    This QR code would be shown to members after their payment is confirmed by an admin.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Scanning Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanning
            </CardTitle>
            <CardDescription>
              How admins scan QR codes for event check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Step 1: Access Scanner</h3>
                <p className="text-blue-800 text-sm">
                  Admin navigates to Events → [Event Name] → QR Scanner
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Step 2: Start Camera</h3>
                <p className="text-blue-800 text-sm">
                  Click "Start Camera" to activate QR code scanning
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Step 3: Scan QR Code</h3>
                <p className="text-blue-800 text-sm">
                  Point camera at member's QR code for automatic check-in
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Result: Successful Check-in</h3>
                <p className="text-green-800 text-sm">
                  Member is automatically checked in with attendance recorded
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild className="w-full">
                <a href="/events/scanner" target="_blank">
                  Open QR Scanner
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Complete QR Code Workflow</CardTitle>
          <CardDescription>
            End-to-end process from RSVP to event check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold mb-1">RSVP Submission</h3>
              <p className="text-xs text-gray-600">
                Member submits RSVP with payment reference
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <h3 className="font-semibold mb-1">Payment Verification</h3>
              <p className="text-xs text-gray-600">
                Admin verifies payment and approves RSVP
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <h3 className="font-semibold mb-1">QR Code Generation</h3>
              <p className="text-xs text-gray-600">
                System generates unique QR code for member
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                4
              </div>
              <h3 className="font-semibold mb-1">Event Check-in</h3>
              <p className="text-xs text-gray-600">
                Admin scans QR code for quick check-in
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-700">✅ Completed Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Real camera integration with react-webcam & jsQR
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  QR code generation after payment approval
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Automatic check-in API with validation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Manual check-in fallback system
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Duplicate check-in prevention
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Mobile app camera integration (expo-barcode-scanner)
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-blue-700">🔧 QR Code Format</h3>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                JTM-EVENT:eventId:userId:timestamp
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Example: JTM-EVENT:evt_123:usr_456:1697123456789
              </p>
              
              <h3 className="font-semibold mb-2 mt-4 text-blue-700">🛡️ Security Features</h3>
              <ul className="space-y-1 text-sm">
                <li>• Admin authentication required</li>
                <li>• Payment verification before QR generation</li>
                <li>• Event-specific QR code validation</li>
                <li>• Timestamp-based uniqueness</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}