// JTM Web - Bulk Import Component for Admin
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/ui/page-header'
import { Download, Upload, FileSpreadsheet, Users, AlertCircle, CheckCircle2, X } from 'lucide-react'

interface ImportError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: ImportError[]
  newUsers: Array<{
    email: string
    firstName: string
    lastName: string
    tempPassword: string
  }>
}

export default function BulkImportComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    // Create CSV template
    const template = [
      'firstName,lastName,email,mobileNumber,membershipType,street,city,state,zipCode,country',
      'John,Doe,john.doe@example.com,1234567890,INDIVIDUAL,123 Main St,Anytown,CA,12345,USA',
      'Jane,Smith,jane.smith@example.com,0987654321,FAMILY,456 Oak Ave,Somewhere,NY,67890,USA',
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'member-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        setError('Please select a CSV or Excel file')
        return
      }
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setImporting(true)
    setProgress(0)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 80))
      }, 200)

      const response = await fetch('/api/users/bulk-import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const sendWelcomeEmails = async () => {
    if (!result?.newUsers.length) return

    try {
      const response = await fetch('/api/users/send-welcome-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: result.newUsers.map(u => ({
            email: u.email,
            firstName: u.firstName,
            tempPassword: u.tempPassword,
          })),
        }),
      })

      if (response.ok) {
        alert('Welcome emails sent successfully!')
      } else {
        alert('Failed to send welcome emails')
      }
    } catch (error) {
      alert('Error sending welcome emails')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Member Import"
        description="Upload an Excel/CSV file to import multiple members"
        action={
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        }
      />

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Upload Member Data
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file with member information. Make sure to follow the template format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">Choose file or drag & drop</p>
              <p className="text-sm text-gray-500">CSV or Excel files only</p>
            </label>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing members...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1"
            >
              {importing ? 'Importing...' : 'Import Members'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {result.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {/* New Users with Temporary Passwords */}
            {result.newUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">New Members Created</h4>
                  <Button onClick={sendWelcomeEmails} size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Send Welcome Emails
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {result.newUsers.map((user, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                          <span className="text-gray-500 ml-2">({user.email})</span>
                        </div>
                        <Badge variant="secondary">
                          Password: {user.tempPassword}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Members have been created with temporary passwords. They will be required to change their password on first login.
                    Please send welcome emails with login instructions.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Import Errors</h4>
                <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">Row {error.row}:</span>{' '}
                        <span className="text-red-600">{error.field} - {error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}