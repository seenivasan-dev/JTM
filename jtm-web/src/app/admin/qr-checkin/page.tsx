'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, Send, RotateCw, CheckCircle, XCircle, Clock, Plus, Calendar, Trash2, Pause, Download } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface QRAttendeeStatus {
  id: string
  name: string
  email: string
  attendingAdults: number
  adults: number
  kids: number
  adultVegFood: number
  adultNonVegFood: number
  kidsFood: number
  emailStatus: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY_SCHEDULED'
  emailSentAt?: string
  emailRetryCount: number
  errorMessage?: string
  isCheckedIn?: boolean
  checkedInAt?: string
}

interface EventInfo {
  id: string
  title: string
  date: string
  location: string
}

export default function QRCheckInUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [attendees, setAttendees] = useState<QRAttendeeStatus[]>([])
  const [sending, setSending] = useState(false)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventInfo | null>(null)
  const [availableEvents, setAvailableEvents] = useState<EventInfo[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [batchSize, setBatchSize] = useState(50)
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0, waiting: false })
  const [shouldStop, setShouldStop] = useState(false)
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(new Set())

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/qr-checkin/events/list')
      if (response.ok) {
        const data = await response.json()
        setAvailableEvents(data.events || [])
      }
    } catch (error) {
      console.error('Fetch events error:', error)
    }
  }

  useEffect(() => {
    fetchEvents()
    // Load saved event from localStorage
    const savedEventId = localStorage.getItem('selectedQREventId')
    if (savedEventId) {
      // Wait for events to load, then select the saved event
      setTimeout(() => {
        fetchEvents().then(() => {
          // Event will be selected after events are loaded
        })
      }, 100)
    }
  }, [])

  useEffect(() => {
    // Once events are loaded, restore selected event from localStorage
    if (availableEvents.length > 0 && !selectedEvent) {
      const savedEventId = localStorage.getItem('selectedQREventId')
      if (savedEventId) {
        const event = availableEvents.find(e => e.id === savedEventId)
        if (event) {
          setSelectedEvent(event)
        }
      }
    }
  }, [availableEvents, selectedEvent])

  useEffect(() => {
    // Fetch attendees whenever selectedEvent changes
    if (selectedEvent) {
      localStorage.setItem('selectedQREventId', selectedEvent.id)
      fetchAttendees()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent])

  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate || !eventLocation) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/qr-checkin/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          time: eventTime,
          location: eventLocation
        })
      })

      const data = await response.json()
      console.log('Create event response:', data)

      if (response.ok && data.event) {
        setSelectedEvent(data.event)
        localStorage.setItem('selectedQREventId', data.event.id)
        setShowEventForm(false)
        await fetchEvents()
        alert('Event created successfully!')
      } else {
        alert(`Failed to create event: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Create event error:', error)
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedEvent) {
      alert('Please create an event and select a file first')
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('eventId', selectedEvent.id)

      const response = await fetch('/api/admin/qr-checkin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResult(data)
        await fetchAttendees()
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

  const handleSelectAll = () => {
    const pendingAttendees = attendees.filter(a => 
      !a.isCheckedIn && (a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED' || a.emailStatus === 'RETRY_SCHEDULED')
    )
    setSelectedAttendeeIds(new Set(pendingAttendees.map(a => a.id)))
  }

  const handleDeselectAll = () => {
    setSelectedAttendeeIds(new Set())
  }

  const handleToggleAttendee = (attendeeId: string) => {
    const newSelected = new Set(selectedAttendeeIds)
    if (newSelected.has(attendeeId)) {
      newSelected.delete(attendeeId)
    } else {
      newSelected.add(attendeeId)
    }
    setSelectedAttendeeIds(newSelected)
  }

  const fetchAttendees = async () => {
    if (!selectedEvent) {
      console.log('fetchAttendees: No event selected')
      return
    }

    console.log('Fetching attendees for event:', selectedEvent.id)

    try {
      const response = await fetch(`/api/admin/qr-checkin/attendees?eventId=${selectedEvent.id}`)
      console.log('Attendees response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Attendees data:', data)
        setAttendees(data.attendees || [])
      } else {
        const errorData = await response.json()
        console.error('Attendees fetch failed:', errorData)
      }
    } catch (error) {
      console.error('Fetch attendees error:', error)
    }
  }

  const handleSendBatch = async () => {
    if (!selectedEvent) {
      console.log('handleSendBatch: No event selected')
      return
    }

    if (selectedAttendeeIds.size === 0) {
      alert('Please select at least one attendee to send emails')
      return
    }

    const selectedAttendees = attendees.filter(a => selectedAttendeeIds.has(a.id))
    const batchToSend = selectedAttendees

    console.log(`Sending ${batchToSend.length} selected emails`)

    setSending(true)
    setShouldStop(false)
    setSendingProgress({ current: 0, total: batchToSend.length, waiting: false })

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    // 5-second gap between emails to avoid Gmail SMTP rate limiting
    const EMAIL_DELAY_MS = 5000

    try {
      for (let i = 0; i < batchToSend.length; i++) {
        if (shouldStop) {
          console.log('Batch sending stopped by user')
          break
        }

        const attendee = batchToSend[i]
        setSendingProgress({ current: i + 1, total: batchToSend.length, waiting: false })

        try {
          const response = await fetch('/api/admin/qr-checkin/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendeeId: attendee.id })
          })

          const data = await response.json()

          if (response.ok && data.success) {
            successCount++
          } else {
            failCount++
            errors.push(`${attendee.email}: ${data.error}`)
          }
        } catch (error) {
          failCount++
          errors.push(`${attendee.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Refresh attendees list periodically
        if ((i + 1) % 10 === 0) {
          await fetchAttendees()
        }

        // Wait between emails (except after the last one) to avoid Gmail rate limiting
        if (i < batchToSend.length - 1 && !shouldStop) {
          setSendingProgress({ current: i + 1, total: batchToSend.length, waiting: true })
          await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS))
        }
      }

      await fetchAttendees()
      
      // Clear successfully sent attendees from selection
      if (successCount > 0) {
        const newSelected = new Set(selectedAttendeeIds)
        batchToSend.forEach(attendee => {
          newSelected.delete(attendee.id)
        })
        setSelectedAttendeeIds(newSelected)
      }
      
      const message = shouldStop 
        ? `Batch stopped. Sent: ${successCount}, Failed: ${failCount}`
        : `Batch complete! Sent: ${successCount}, Failed: ${failCount}`
      
      if (errors.length > 0 && errors.length <= 5) {
        alert(`${message}\n\nErrors:\n${errors.join('\n')}`)
      } else if (errors.length > 5) {
        alert(`${message}\n\n${errors.length} errors occurred. Check console for details.`)
        console.error('Email errors:', errors)
      } else {
        alert(message)
      }
    } catch (error) {
      console.error('Send batch error:', error)
      alert('Failed to send batch')
    } finally {
      setSending(false)
      setSendingProgress({ current: 0, total: 0 })
      setShouldStop(false)
    }
  }

  const handleRetrySingle = async (attendeeId: string) => {
    setRetrying(attendeeId)

    try {
      const response = await fetch('/api/admin/qr-checkin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId, forceRetry: true })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Email sent successfully')
        await fetchAttendees()
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

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    const confirmMessage = `Are you sure you want to delete "${selectedEvent.title}"?\n\nThis will permanently delete:\n- The event\n- All ${attendees.length} attendees\n- All check-in records\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/qr-checkin/events/delete?eventId=${selectedEvent.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Event deleted successfully!\n${data.deletedCount.attendees} attendees and ${data.deletedCount.checkIns} check-ins were also removed.`)
        setSelectedEvent(null)
        localStorage.removeItem('selectedQREventId')
        setAttendees([])
        await fetchEvents()
      } else {
        alert(`Failed to delete event: ${data.error}`)
      }
    } catch (error) {
      console.error('Delete event error:', error)
      alert('Failed to delete event')
    } finally {
      setDeleting(false)
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">QR Check-In System</h1>
          <p className="text-sm sm:text-base text-gray-600">Upload attendee list and send QR codes for check-in</p>
        </div>

        {/* Event Selection/Creation */}
        <Card className="p-3 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Step 1: Create or Select Event</h2>
          
          {!selectedEvent ? (
            <div className="space-y-4">
              {/* Existing Events List */}
              {availableEvents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Event</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    onChange={(e) => {
                      const event = availableEvents.find(ev => ev.id === e.target.value)
                      if (event) {
                        setSelectedEvent(event)
                        fetchAttendees()
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Select an event --</option>
                    {availableEvents.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Or create a new event below</p>
                </div>
              )}

              {/* Create New Event Button/Form */}
              {!showEventForm ? (
                <Button onClick={() => setShowEventForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                      <Input
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g., Annual Gathering 2026"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <Input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <Input
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g., Tokyo Community Center"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCreateEvent} className="bg-green-600 hover:bg-green-700">
                      Create Event
                    </Button>
                    <Button onClick={() => setShowEventForm(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 text-base sm:text-lg">{selectedEvent.title}</h3>
                  <div className="mt-2 space-y-1 text-xs sm:text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="break-words">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => router.push(`/admin/qr-checkin/scanner/${selectedEvent.id}`)}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    Go to Scanner
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedEvent(null)
                      localStorage.removeItem('selectedQREventId')
                      setAttendees([])
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-white text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    Change Event
                  </Button>
                  <Button
                    onClick={handleDeleteEvent}
                    disabled={deleting}
                    variant="outline"
                    size="sm"
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    {deleting ? (
                      <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {selectedEvent && (
          <>
            {/* Upload Section */}
            <Card className="p-3 sm:p-6 mb-4 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Step 2: Upload Attendee List</h2>
              <div className="space-y-4">
                {/* Template Download Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Need the upload template?</p>
                    <p className="text-xs text-indigo-600 mt-0.5">
                      Download the Excel template with sample data and instructions
                    </p>
                  </div>
                  <a href="/api/admin/qr-checkin/template" download>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap border-indigo-300 text-indigo-700 hover:bg-indigo-100 bg-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV or Excel File
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">
                    Required columns: <span className="font-medium text-gray-700">name, email</span> &nbsp;·&nbsp;
                    Food columns: <span className="font-medium text-green-700">Adult Veg Food</span>,{' '}
                    <span className="font-medium text-red-700">Adult Non-Veg Food</span>,{' '}
                    <span className="font-medium text-blue-700">Kids Food</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-sm whitespace-nowrap"
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

            {/* Check-in Statistics */}
            {attendees.length > 0 && (
              <Card className="p-3 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Check-in Status</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-blue-600 font-medium">Registrations</div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{attendees.length}</div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-indigo-600 font-medium">Total Persons</div>
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-900 mt-1">
                      {attendees.reduce((sum, a) => sum + (a.attendingAdults || 0) + (a.kidsFood || 0), 0)}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-green-600 font-medium">Checked In</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">
                      {attendees.filter(a => a.isCheckedIn).length}
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-orange-600 font-medium">Not Checked In</div>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-900 mt-1">
                      {attendees.filter(a => !a.isCheckedIn).length}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-purple-600 font-medium">Check-in Rate</div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1">
                      {attendees.length > 0
                        ? Math.round((attendees.filter(a => a.isCheckedIn).length / attendees.length) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Email Status Section */}
            <Card className="p-3 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Step 3: Send QR Code Emails</h2>
                {attendees.length > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {attendees.filter(a => a.emailStatus === 'SENT').length} of {attendees.length} emails sent
                    {attendees.filter(a => a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED').length > 0 && (
                      <span className="text-orange-600 font-medium ml-2">
                        ({attendees.filter(a => a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED').length} pending)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Batch Controls */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                {/* Selection Controls */}
                <div className="mb-3 pb-3 border-b border-purple-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        <span className="text-purple-600 font-bold">{selectedAttendeeIds.size}</span> attendee{selectedAttendeeIds.size !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-gray-600">
                        {attendees.filter(a => !a.isCheckedIn && (a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED' || a.emailStatus === 'RETRY_SCHEDULED')).length} available to send
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSelectAll}
                        variant="outline"
                        size="sm"
                        disabled={sending}
                        className="text-xs"
                      >
                        Select All Pending
                      </Button>
                      <Button
                        onClick={handleDeselectAll}
                        variant="outline"
                        size="sm"
                        disabled={sending}
                        className="text-xs"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How it works
                    </label>
                    <p className="text-xs text-gray-600">
                      ✓ Select attendees using checkboxes below<br/>
                      ✓ Click "Send to Selected" to send emails<br/>
                      ✓ Successfully sent emails will be auto-deselected
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={fetchAttendees}
                      variant="outline"
                      size="sm"
                      disabled={sending}
                      className="text-xs sm:text-sm"
                    >
                      <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Refresh
                    </Button>
                    
                    {sending ? (
                      <Button
                        onClick={() => setShouldStop(true)}
                        variant="outline"
                        size="sm"
                        className="bg-red-50 text-red-600 hover:bg-red-100 border-red-300 text-xs sm:text-sm"
                      >
                        <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Stop Batch
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendBatch}
                        disabled={selectedAttendeeIds.size === 0}
                        className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                        size="sm"
                      >
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Send to Selected ({selectedAttendeeIds.size})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {sending && sendingProgress.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Sending emails...</span>
                      <span>{sendingProgress.current} / {sendingProgress.total}</span>
                    </div>
                    <Progress 
                      value={(sendingProgress.current / sendingProgress.total) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {shouldStop
                        ? 'Stopping after current email...'
                        : sendingProgress.waiting
                          ? 'Waiting 5s before next send (Gmail rate limit)...'
                          : 'Sending email, do not close this page'}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-center py-3 px-2 font-semibold text-gray-700 w-12">
                        <input
                          type="checkbox"
                          checked={selectedAttendeeIds.size > 0 && selectedAttendeeIds.size === attendees.filter(a => !a.isCheckedIn && (a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED' || a.emailStatus === 'RETRY_SCHEDULED')).length}
                          onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                          className="w-4 h-4 cursor-pointer"
                          disabled={sending}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-center py-3 px-4 font-semibold text-indigo-700">Attending</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Adult Veg</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Adult Non-Veg</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Kids</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Food / Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent At</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-8 text-gray-500">
                          No attendees added yet. Upload a file to get started.
                        </td>
                      </tr>
                    ) : (
                      attendees.map((attendee) => {
                        const totalCoupons = (attendee.adultVegFood || 0) + (attendee.adultNonVegFood || 0) + (attendee.kidsFood || 0)
                        const totalPersons = (attendee.attendingAdults || 0) + (attendee.kidsFood || 0)
                        const eventOnly = totalCoupons === 0
                        const canSelect = !attendee.isCheckedIn && (attendee.emailStatus === 'PENDING' || attendee.emailStatus === 'FAILED' || attendee.emailStatus === 'RETRY_SCHEDULED')
                        return (
                        <tr key={attendee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={selectedAttendeeIds.has(attendee.id)}
                              onChange={() => handleToggleAttendee(attendee.id)}
                              disabled={!canSelect || sending}
                              className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </td>
                          <td className="py-3 px-4">{attendee.name}</td>
                          <td className="py-3 px-4">{attendee.email}</td>
                          <td className="py-3 px-4 text-center">
                            {totalPersons > 0 ? (
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-semibold text-sm">
                                {totalPersons}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-green-600">{attendee.adultVegFood || 0}</td>
                          <td className="py-3 px-4 text-center font-semibold text-red-600">{attendee.adultNonVegFood || 0}</td>
                          <td className="py-3 px-4 text-center font-semibold text-blue-600">{attendee.kidsFood || 0}</td>
                          <td className="py-3 px-4 text-center">
                            {eventOnly ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold text-xs">
                                Event Only
                              </span>
                            ) : (
                              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                                {totalCoupons}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(attendee.emailStatus)}</td>
                          <td className="py-3 px-4">
                            {attendee.isCheckedIn ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" /> Checked In
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                                Not Checked In
                              </Badge>
                            )}
                            {attendee.checkedInAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(attendee.checkedInAt).toLocaleString()}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {attendee.emailSentAt ? new Date(attendee.emailSentAt).toLocaleString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {attendee.isCheckedIn ? (
                              <span className="text-xs text-gray-500">Already checked in</span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetrySingle(attendee.id)}
                                disabled={retrying === attendee.id}
                              >
                                {retrying === attendee.id ? (
                                  <RotateCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="w-3 h-3 mr-1" />
                                    {attendee.emailStatus === 'PENDING' ? 'Send' : 'Resend'}
                                  </>
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {attendees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No attendees added yet. Upload a file to get started.
                  </div>
                ) : (
                  attendees.map((attendee) => {
                    const totalCoupons = (attendee.adultVegFood || 0) + (attendee.adultNonVegFood || 0) + (attendee.kidsFood || 0)
                    const totalPersons = (attendee.attendingAdults || 0) + (attendee.kidsFood || 0)
                    const eventOnly = totalCoupons === 0
                    const canSelect = !attendee.isCheckedIn && (attendee.emailStatus === 'PENDING' || attendee.emailStatus === 'FAILED' || attendee.emailStatus === 'RETRY_SCHEDULED')
                    return (
                      <div key={attendee.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selectedAttendeeIds.has(attendee.id)}
                              onChange={() => handleToggleAttendee(attendee.id)}
                              disabled={!canSelect || sending}
                              className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{attendee.name}</h3>
                            <p className="text-xs text-gray-600 truncate">{attendee.email}</p>
                            {totalPersons > 0 && (
                              <p className="text-xs text-indigo-600 font-medium mt-0.5">{totalPersons} person{totalPersons !== 1 ? 's' : ''} attending</p>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {attendee.isCheckedIn ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" /> Checked In
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300 text-xs">
                                Not Checked In
                              </Badge>
                            )}
                          </div>
                        </div>

                        {eventOnly ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-2 my-2 text-center">
                            <span className="text-green-700 font-semibold text-xs">🎉 Event Only — No Food Coupons</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 my-2 text-xs">
                            <div className="bg-green-50 rounded p-2 text-center">
                              <div className="text-green-600 font-medium">Veg</div>
                              <div className="font-bold text-green-900">{attendee.adultVegFood || 0}</div>
                            </div>
                            <div className="bg-red-50 rounded p-2 text-center">
                              <div className="text-red-600 font-medium">Non-Veg</div>
                              <div className="font-bold text-red-900">{attendee.adultNonVegFood || 0}</div>
                            </div>
                            <div className="bg-blue-50 rounded p-2 text-center">
                              <div className="text-blue-600 font-medium">Kids</div>
                              <div className="font-bold text-blue-900">{attendee.kidsFood || 0}</div>
                            </div>
                            <div className="bg-orange-50 rounded p-2 text-center">
                              <div className="text-orange-600 font-medium">Total</div>
                              <div className="font-bold text-orange-900">{totalCoupons}</div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 text-xs mb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Email Status:</span>
                            {getStatusBadge(attendee.emailStatus)}
                          </div>
                          {attendee.emailSentAt && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Sent At:</span>
                              <span className="text-gray-700">{new Date(attendee.emailSentAt).toLocaleString()}</span>
                            </div>
                          )}
                          {attendee.checkedInAt && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Checked In At:</span>
                              <span className="text-gray-700">{new Date(attendee.checkedInAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {!attendee.isCheckedIn && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetrySingle(attendee.id)}
                            disabled={retrying === attendee.id}
                            className="w-full text-xs"
                          >
                            {retrying === attendee.id ? (
                              <RotateCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                {attendee.emailStatus === 'PENDING' ? 'Send Email' : 'Resend Email'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
