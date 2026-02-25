'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  ArrowLeft,
  Send,
  CheckCircle,
  QrCode,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  description: string
  flyer?: string | null
  date: string
  location: string
  rsvpRequired: boolean
  rsvpDeadline?: string | null
  maxParticipants?: number | null
  rsvpForm?: {
    fields: Array<{
      id: string
      type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'
      label: string
      required: boolean
      options?: string[]
    }>
  } | null
  foodConfig?: {
    enabled: boolean
    vegFood: boolean
    nonVegFood: boolean
    kidsFood: boolean
    allowNoFood: boolean
  } | null
  currentAttendees: number
  rsvpResponses: Array<{
    id: string
    responses: any
    paymentConfirmed: boolean
    qrCode?: string | null
    checkedIn: boolean
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  membershipType: string
  isAdmin: boolean
}

interface UserRsvp {
  id: string
  responses: Record<string, string | number | boolean>
  paymentConfirmed: boolean
  qrCode?: string | null
  checkedIn: boolean
  createdAt: string
  vegCount?: number
  nonVegCount?: number
  kidsCount?: number
  noFood?: boolean
}

interface EventDetailClientProps {
  event: Event
  user: User
  userRsvp: UserRsvp | null
}

export default function EventDetailClient({ event, user, userRsvp }: EventDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rsvpData, setRsvpData] = useState<Record<string, string | number | boolean>>(
    userRsvp?.responses || {}
  )
  const [foodData, setFoodData] = useState({
    vegCount: userRsvp?.vegCount ?? 0,
    nonVegCount: userRsvp?.nonVegCount ?? 0,
    kidsCount: userRsvp?.kidsCount ?? 0,
    noFood: userRsvp?.noFood ?? false,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isRSVPDeadlinePassed = () => {
    if (!event.rsvpDeadline) return false
    return new Date() > new Date(event.rsvpDeadline)
  }

  const isEventFull = () => {
    return event.maxParticipants ? event.currentAttendees >= event.maxParticipants : false
  }

  const isEventPast = () => {
    return new Date() > new Date(event.date)
  }

  const canRSVP = () => {
    return event.rsvpRequired && 
           !isRSVPDeadlinePassed() && 
           !isEventFull() && 
           !isEventPast()
  }

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          userEmail: user.email,
          responses: rsvpData,
          ...(event.foodConfig?.enabled ? foodData : {}),
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit RSVP')
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert('Failed to submit RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/events')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAction = async (rsvpId: string, action: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsvpId,
          action,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process payment action')
      }
    } catch (error) {
      console.error('Error processing payment action:', error)
      alert('Failed to process payment action')
    } finally {
      setLoading(false)
    }
  }

  const updateRSVPField = (fieldId: string, value: any) => {
    setRsvpData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const renderRSVPField = (field: any) => {
    const value = rsvpData[field.id] || ''
    const stringValue = typeof value === 'string' ? value : String(value)

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={stringValue}
            onChange={(e) => updateRSVPField(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={stringValue}
            onChange={(e) => updateRSVPField(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )

      case 'select':
        return (
          <Select
            value={stringValue}
            onValueChange={(newValue) => updateRSVPField(field.id, newValue)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${option}`}
                  name={field.id}
                  value={option}
                  checked={stringValue === option}
                  onChange={(e) => updateRSVPField(field.id, e.target.value)}
                  className="h-4 w-4"
                  required={field.required}
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked: boolean) => updateRSVPField(field.id, checked)}
          />
        )

      default:
        return null
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

        {user.isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/events/scanner?eventId=${event.id}`}>
                <QrCode className="h-4 w-4 mr-2" />
                QR Scanner
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/events/${event.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        )}
      </div>

      {/* Event Header */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                {isEventPast() && (
                  <Badge variant="secondary">Past Event</Badge>
                )}
              </div>
            </CardHeader>
            
            {event.flyer && (
              <div className="px-6">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src={event.flyer}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Info Sidebar */}
        <div className="space-y-6">
          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Attendees</span>
                </div>
                <div className="font-semibold">
                  {event.currentAttendees}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </div>
              </div>

              {event.rsvpRequired && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>RSVP Required</span>
                    </div>
                    <Badge variant="outline">Required</Badge>
                  </div>

                  {event.rsvpDeadline && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>RSVP Deadline</span>
                      </div>
                      <div className="text-sm text-right">
                        {formatDate(event.rsvpDeadline)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          {userRsvp && userRsvp.paymentConfirmed && (userRsvp as any).qrCode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Your Event QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                  <div className="mx-auto mb-4 flex justify-center">
                    <QRCodeDisplay 
                      data={(userRsvp as any).qrCode} 
                      size={250}
                    />
                  </div>
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    ✅ Ready for Check-in
                  </p>
                  <p className="text-sm text-gray-600 mb-3">Show this QR code at the event for check-in</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Screenshot this page or show your phone screen to the event staff
                  </p>
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View QR Code Text
                    </summary>
                    <div className="text-xs font-mono break-all bg-white p-2 rounded border mt-2 text-left">
                      {(userRsvp as any).qrCode}
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code Pending */}
          {userRsvp && !userRsvp.paymentConfirmed && (userRsvp as any).paymentReference && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Payment Under Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your payment is being verified. You will receive your QR code via email once approved.
                    <div className="mt-2 text-sm font-medium">
                      Payment Reference: {(userRsvp as any).paymentReference}
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* RSVP Section - Only show to non-admin users */}
      {event.rsvpRequired && !user.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>RSVP</CardTitle>
            <CardDescription>
              {userRsvp 
                ? 'You have already RSVP\'d to this event. You can update your response below.'
                : 'Please RSVP to attend this event.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRsvp && (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You RSVP&apos;d on {formatDate(userRsvp.createdAt)}
                </AlertDescription>
              </Alert>
            )}

            {!canRSVP() ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isEventPast() ? 'This event has already passed.' :
                   isRSVPDeadlinePassed() ? 'The RSVP deadline has passed.' :
                   isEventFull() ? 'This event is full.' :
                   'RSVP is not available for this event.'}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                {event.rsvpForm?.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderRSVPField(field)}
                  </div>
                ))}

                {/* Food Preference Section */}
                {event.foodConfig?.enabled && (
                  <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
                    <div className="flex items-center gap-2 font-medium">
                      <span>🍽️</span>
                      <span>Food Preference</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Let us know how many meals you need in each category.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {event.foodConfig.vegFood && (
                        <div className="space-y-1">
                          <Label htmlFor="vegCount">🥦 Veg Meals (Adults)</Label>
                          <Input
                            id="vegCount"
                            type="number"
                            min={0}
                            value={foodData.vegCount}
                            onChange={(e) => setFoodData(prev => ({ ...prev, vegCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                            disabled={foodData.noFood}
                          />
                        </div>
                      )}
                      {event.foodConfig.nonVegFood && (
                        <div className="space-y-1">
                          <Label htmlFor="nonVegCount">🍗 Non-Veg Meals (Adults)</Label>
                          <Input
                            id="nonVegCount"
                            type="number"
                            min={0}
                            value={foodData.nonVegCount}
                            onChange={(e) => setFoodData(prev => ({ ...prev, nonVegCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                            disabled={foodData.noFood}
                          />
                        </div>
                      )}
                      {event.foodConfig.kidsFood && (
                        <div className="space-y-1">
                          <Label htmlFor="kidsCount">🧒 Kids Meals</Label>
                          <Input
                            id="kidsCount"
                            type="number"
                            min={0}
                            value={foodData.kidsCount}
                            onChange={(e) => setFoodData(prev => ({ ...prev, kidsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                            disabled={foodData.noFood}
                          />
                        </div>
                      )}
                    </div>
                    {event.foodConfig.allowNoFood && (
                      <div className="flex items-center space-x-2 pt-1">
                        <Checkbox
                          id="noFood"
                          checked={foodData.noFood}
                          onCheckedChange={(checked: boolean) =>
                            setFoodData(prev => ({
                              ...prev,
                              noFood: checked,
                              ...(checked ? { vegCount: 0, nonVegCount: 0, kidsCount: 0 } : {}),
                            }))
                          }
                        />
                        <Label htmlFor="noFood">I don&apos;t want food at this event</Label>
                      </div>
                    )}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-lg">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {userRsvp ? 'Updating...' : 'Submitting...'}
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {userRsvp ? 'Update RSVP' : 'Submit RSVP'}
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin: RSVP Responses */}
      {user.isAdmin && event.rsvpResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>RSVP Responses ({event.rsvpResponses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {event.rsvpResponses.map((response) => (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {response.user.firstName} {response.user.lastName}
                    </div>
                    <div className="flex gap-2">
                      {response.checkedIn && (
                        <Badge variant="default">Checked In</Badge>
                      )}
                      {response.paymentConfirmed ? (
                        <Badge variant="secondary">Payment Confirmed</Badge>
                      ) : (
                        <Badge variant="outline">Payment Pending</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {response.user.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    RSVP&apos;d on {formatDate(response.createdAt)}
                  </div>
                  
                  {/* Payment Reference */}
                  {(response as any).paymentReference && (
                    <div className="mt-2 text-sm">
                      <strong>Payment Reference:</strong> {(response as any).paymentReference}
                    </div>
                  )}

                  {/* Admin Actions */}
                  {!response.paymentConfirmed && (response as any).paymentReference && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePaymentAction(response.id, 'approve_payment')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve Payment & Send QR
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePaymentAction(response.id, 'reject_payment')}
                      >
                        Reject Payment
                      </Button>
                    </div>
                  )}

                  {response.responses && Object.keys(response.responses).length > 0 && (
                    <div className="mt-2 text-sm">
                      <strong>Responses:</strong>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
                        {JSON.stringify(response.responses, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}