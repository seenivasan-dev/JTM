'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, Send, RotateCw, CheckCircle, XCircle, Clock, Plus, Calendar, Trash2 } from 'lucide-react'

interface QRAttendeeStatus {
  id: string
  name: string
  email: string
  adults: number
  kids: number
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

  const handleSendAll = async () => {
    if (!selectedEvent) {
      console.log('handleSendAll: No event selected')
      return
    }

    console.log('Sending emails for event:', selectedEvent.id)
    console.log('Number of attendees:', attendees.length)

    setSending(true)

    try {
      const response = await fetch('/api/admin/qr-checkin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent.id })
      })

      console.log('Send email response status:', response.status)
      const data = await response.json()
      console.log('Send email response:', data)

      if (response.ok) {
        alert(`Emails sent: ${data.sent} successful, ${data.failed} failed`)
        await fetchAttendees()
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

  const handleRetrySingle = async (attendeeId: string) => {
    setRetrying(attendeeId)

    try {
      const response = await fetch('/api/admin/qr-checkin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId })
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Check-In System</h1>
          <p className="text-gray-600">Upload attendee list and send QR codes for check-in</p>
        </div>

        {/* Event Selection/Creation */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Step 1: Create or Select Event</h2>
          
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                      <Input
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g., Annual Gathering 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <Input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <Input
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g., Tokyo Community Center"
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 text-lg">{selectedEvent.title}</h3>
                  <div className="mt-2 space-y-1 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/admin/qr-checkin/scanner/${selectedEvent.id}`)}
                    variant="outline"
                    size="sm"
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
                    className="bg-white"
                  >
                    Change Event
                  </Button>
                  <Button
                    onClick={handleDeleteEvent}
                    disabled={deleting}
                    variant="outline"
                    size="sm"
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  >
                    {deleting ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1" />
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
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Step 2: Upload Attendee List</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV or Excel File
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Required columns: Email Address, Primary Member - First Name, Primary Member - Last Name, Adults, Kids (optional: Phone Number)
                  </p>
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

            {/* Check-in Statistics */}
            {attendees.length > 0 && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Check-in Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Total Attendees</div>
                    <div className="text-3xl font-bold text-blue-900 mt-1">{attendees.length}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Checked In</div>
                    <div className="text-3xl font-bold text-green-900 mt-1">
                      {attendees.filter(a => a.isCheckedIn).length}
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium">Pending</div>
                    <div className="text-3xl font-bold text-orange-900 mt-1">
                      {attendees.filter(a => !a.isCheckedIn).length}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium">Check-in Rate</div>
                    <div className="text-3xl font-bold text-purple-900 mt-1">
                      {attendees.length > 0 
                        ? Math.round((attendees.filter(a => a.isCheckedIn).length / attendees.length) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Email Status Section */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Step 3: Send QR Code Emails</h2>
                  {attendees.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {attendees.filter(a => a.emailStatus === 'SENT').length} of {attendees.length} emails sent
                      {attendees.filter(a => a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED').length > 0 && (
                        <span className="text-orange-600 font-medium ml-2">
                          ({attendees.filter(a => a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED').length} pending)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={fetchAttendees}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleSendAll}
                    disabled={sending || attendees.length === 0 || attendees.filter(a => a.emailStatus === 'PENDING' || a.emailStatus === 'FAILED' || a.emailStatus === 'RETRY_SCHEDULED').length === 0}
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
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Adults</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Kids</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Coupons</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent At</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          No attendees added yet. Upload a file to get started.
                        </td>
                      </tr>
                    ) : (
                      attendees.map((attendee) => {
                        const totalCoupons = (attendee.adults || 1) + (attendee.kids || 0)
                        return (
                        <tr key={attendee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{attendee.name}</td>
                          <td className="py-3 px-4">{attendee.email}</td>
                          <td className="py-3 px-4 text-center font-semibold text-blue-600">{attendee.adults || 1}</td>
                          <td className="py-3 px-4 text-center font-semibold text-green-600">{attendee.kids || 0}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                              {totalCoupons}
                            </span>
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
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
