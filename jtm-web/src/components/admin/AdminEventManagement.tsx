'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus,
  Eye,
  Edit,
  QrCode,
  Search,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface RSVPResponse {
  id: string
  responses: Record<string, unknown>
  paymentConfirmed: boolean
  checkedIn: boolean
  checkedInAt: string | null
  createdAt?: string
  updatedAt?: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    membershipType: string
    familyMembers: Array<{
      id: string
      firstName: string
      lastName: string
      age: number
      relationship: string
    }>
  }
}

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
  rsvpForm?: Record<string, unknown>
  rsvpResponses: RSVPResponse[]
  stats: {
    totalRSVPs: number
    checkedIn: number
    pending: number
    isActive: boolean
    isUpcoming: boolean
    isPast: boolean
  }
}

interface AdminEventManagementProps {
  events: Event[]
}

export default function AdminEventManagement({ events }: AdminEventManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'past'>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Helper function to safely extract string values
  const getStringValue = (value: unknown, defaultValue = 'Not specified'): string => {
    if (typeof value === 'string') return value
    if (value !== null && value !== undefined) return String(value)
    return defaultValue
  }

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'upcoming' && event.stats.isUpcoming) ||
                         (statusFilter === 'active' && event.stats.isActive) ||
                         (statusFilter === 'past' && event.stats.isPast)
    
    return matchesSearch && matchesStatus
  })

  // Calculate overall statistics
  const overallStats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.stats.isUpcoming).length,
    activeEvents: events.filter(e => e.stats.isActive).length,
    totalRSVPs: events.reduce((sum, e) => sum + e.stats.totalRSVPs, 0),
  }

  const getEventStatusBadge = (event: Event) => {
    if (event.stats.isPast) {
      return <Badge variant="secondary">Past</Badge>
    } else if (event.stats.isUpcoming) {
      return <Badge variant="default">Upcoming</Badge>
    } else {
      return <Badge variant="destructive">Active</Badge>
    }
  }

  const exportEventData = (event: Event) => {
    // For simple export without dynamic fields - just basic info
    const csvData = [
      ['Name', 'Email', 'Membership Type', 'Check-in Date', 'Checked In', 'Family Members', 'Payment Status'],
      ...event.rsvpResponses.map(rsvp => [
        `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        rsvp.user.email,
        rsvp.user.membershipType,
        rsvp.checkedInAt ? format(new Date(rsvp.checkedInAt), 'MMM dd, yyyy') : 'Not checked in',
        rsvp.checkedIn ? 'Yes' : 'No',
        rsvp.user.familyMembers.length.toString(),
        rsvp.paymentConfirmed ? 'Confirmed' : 'Pending'
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_attendees.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
          <p className="text-muted-foreground">Manage events and track RSVPs</p>
        </div>
        <Link href="/events/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {overallStats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalRSVPs}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'upcoming', 'active', 'past'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status as any)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="grid gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    {getEventStatusBadge(event)}
                  </div>
                  <CardDescription className="text-sm">
                    {event.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/events/${event.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {selectedEvent?.id === event.id ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Basic Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.stats.totalRSVPs} RSVPs</span>
                </div>
              </div>

              {/* RSVP Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">{event.stats.totalRSVPs}</div>
                  <div className="text-sm text-blue-800">Total RSVPs</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">{event.stats.checkedIn}</div>
                  <div className="text-sm text-green-800">Checked In</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600">{event.stats.pending}</div>
                  <div className="text-sm text-yellow-800">Pending</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/events/${event.id}/rsvp`}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage RSVPs
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/events/scanner?eventId=${event.id}`}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Scanner
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportEventData(event)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Attendees
                </Button>
              </div>

              {/* Detailed RSVP Information */}
              {selectedEvent?.id === event.id && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">RSVP Details</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {event.rsvpResponses.map((rsvp) => (
                      <div key={rsvp.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">
                              {rsvp.user.firstName} {rsvp.user.lastName}
                            </h5>
                            <p className="text-sm text-muted-foreground">{rsvp.user.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {rsvp.checkedIn ? (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Checked In
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                            {rsvp.paymentConfirmed && (
                              <Badge variant="outline" className="text-green-600">
                                Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* RSVP Details */}
                        <div className="text-sm space-y-1">
                          <div className="flex gap-4">
                            <span className="text-muted-foreground">Food:</span>
                            <span className="capitalize">
                              {getStringValue((rsvp.responses as Record<string, unknown>)?.foodPreference)}
                            </span>
                          </div>
                          
                          {rsvp.user.familyMembers.length > 0 && (
                            <div className="flex gap-4">
                              <span className="text-muted-foreground">Family:</span>
                              <span>{rsvp.user.familyMembers.length} members</span>
                            </div>
                          )}
                          
                          {(rsvp.responses as Record<string, unknown>)?.specialRequests && typeof (rsvp.responses as Record<string, unknown>).specialRequests === 'string' ? (
                            <div className="flex gap-4">
                              <span className="text-muted-foreground">Notes:</span>
                              <span>{String(getStringValue((rsvp.responses as Record<string, unknown>).specialRequests))}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters or search term.'
              : 'Create your first event to get started.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link href="/events/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}