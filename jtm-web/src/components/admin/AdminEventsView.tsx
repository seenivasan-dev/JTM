'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
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
  QrCode,
  Search,
  Download,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles
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

interface AdminEventsViewProps {
  events: Event[]
}

export default function AdminEventsView({ events }: AdminEventsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'upcoming' && event.stats.isUpcoming) ||
                         (statusFilter === 'past' && event.stats.isPast)
    
    return matchesSearch && matchesStatus
  })

  // Calculate overall statistics
  const overallStats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.stats.isUpcoming).length,
    pastEvents: events.filter(e => e.stats.isPast).length,
    totalRSVPs: events.reduce((sum, e) => sum + e.stats.totalRSVPs, 0),
    avgRSVPsPerEvent: Math.round(events.reduce((sum, e) => sum + e.stats.totalRSVPs, 0) / Math.max(events.length, 1))
  }

  const exportEventData = (event: Event) => {
    const csvData = [
      ['Name', 'Email', 'Membership Type', 'Checked In', 'Check-in Date', 'Payment Status'],
      ...event.rsvpResponses.map(rsvp => [
        `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        rsvp.user.email,
        rsvp.user.membershipType,
        rsvp.checkedIn ? 'Yes' : 'No',
        rsvp.checkedInAt ? format(new Date(rsvp.checkedInAt), 'MMM dd, yyyy HH:mm') : 'Not checked in',
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Events Management</h1>
              <p className="text-white/90 text-lg">Manage all community events and track attendance</p>
            </div>
          </div>
          <Link href="/events/create">
            <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="elevated-card border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{overallStats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="elevated-card border-t-4 border-t-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{overallStats.upcomingEvents}</div>
          </CardContent>
        </Card>

        <Card className="elevated-card border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Total RSVPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{overallStats.totalRSVPs}</div>
          </CardContent>
        </Card>

        <Card className="elevated-card border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Avg RSVPs/Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{overallStats.avgRSVPsPerEvent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={statusFilter === 'past' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('past')}
              >
                Past
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No events found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="elevated-card hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge variant={event.stats.isUpcoming ? 'default' : 'secondary'}>
                        {event.stats.isUpcoming ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-secondary" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/events/${event.id}/rsvp`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View RSVPs
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportEventData(event)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardDescription className="mb-4 line-clamp-2">{event.description}</CardDescription>
                
                {/* Event Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Total RSVPs</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{event.stats.totalRSVPs}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Checked In</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{event.stats.checkedIn}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">{event.stats.pending}</div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link href={`/admin/events/${event.id}/rsvp`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Check-in
                    </Button>
                  </Link>
                  <Link href={`/admin/events/${event.id}/reports`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Reports
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
