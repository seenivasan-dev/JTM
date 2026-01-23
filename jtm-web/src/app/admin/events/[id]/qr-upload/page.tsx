'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, Send, RotateCw, CheckCircle, XCircle, Clock } from 'lucide-react'

interface QRCodeStatus {
  id: string
  userName: string
  userEmail: string
  emailStatus: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY_SCHEDULED'
  emailSentAt?: string
  emailRetryCount: number
  errorMessage?: string
}

export default function QRUploadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [qrCodes, setQrCodes] = useState<QRCodeStatus[]>([])
  const [sending, setSending] = useState(false)
  const [retrying, setRetrying] = useState<string | null>(null)

  const eventId = params.id

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('eventId', eventId)

      const response = await fetch('/api/admin/rsvp-qrcodes/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResult(data)
        // Refresh QR codes list
        await fetchQRCodes()
      } else {
        alert(`Upload failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const fetchQRCodes = async () => {
    try {
      const response = await fetch(`/api/admin/rsvp-qrcodes/list?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.qrCodes || [])
      }
    } catch (error) {
      console.error('Fetch QR codes error:', error)
    }
  }

  const handleSendAll = async () => {
    setSending(true)

    try {
      const response = await fetch('/api/admin/rsvp-qrcodes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Emails sent: ${data.sent} successful, ${data.failed} failed`)
        await fetchQRCodes()
      } else {
        alert(`Failed to send emails: ${data.error}`)
      }
    } catch (error) {
      console.error('Send emails error:', error)
      alert('Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  const handleRetrySingle = async (qrCodeId: string) => {
    setRetrying(qrCodeId)

    try {
      const response = await fetch('/api/admin/rsvp-qrcodes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Email sent successfully')
        await fetchQRCodes()
      } else {
        alert(`Failed to send email: ${data.error}`)
      }
    } catch (error) {
      console.error('Retry error:', error)
      alert('Failed to retry email')
    } finally {
      setRetrying(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Sent</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>
      case 'RETRY_SCHEDULED':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><RotateCw className="w-3 h-3 mr-1" /> Retry Scheduled</Badge>
      case 'PENDING':
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RSVP QR Code Upload</h1>
          <p className="text-gray-600">Upload RSVP responses and generate QR codes for event check-in</p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload RSVP Responses</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV or Excel File
              </label>
              <div className="flex gap-4">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Generate QR Codes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {uploadResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Upload Results</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-green-700">✓ Successful: {uploadResult.results.success}</p>
                  <p className="text-red-700">✗ Failed: {uploadResult.results.failed}</p>
                  {uploadResult.results.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-red-800">Errors:</p>
                      <ul className="list-disc list-inside text-red-700">
                        {uploadResult.results.errors.map((error: string, i: number) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* QR Codes Status Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">QR Code Email Status</h2>
            <div className="flex gap-3">
              <Button
                onClick={fetchQRCodes}
                variant="outline"
                size="sm"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleSendAll}
                disabled={sending || qrCodes.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                {sending ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send All Pending
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent At</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Retry Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No QR codes generated yet. Upload RSVP responses to get started.
                    </td>
                  </tr>
                ) : (
                  qrCodes.map((qr) => (
                    <tr key={qr.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{qr.userName}</td>
                      <td className="py-3 px-4">{qr.userEmail}</td>
                      <td className="py-3 px-4">{getStatusBadge(qr.emailStatus)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {qr.emailSentAt ? new Date(qr.emailSentAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">{qr.emailRetryCount}</td>
                      <td className="py-3 px-4">
                        {(qr.emailStatus === 'FAILED' || qr.emailStatus === 'PENDING') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetrySingle(qr.id)}
                            disabled={retrying === qr.id}
                          >
                            {retrying === qr.id ? (
                              <RotateCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <RotateCw className="w-3 h-3 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
