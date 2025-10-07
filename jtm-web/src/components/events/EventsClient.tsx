'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Plus,
  Eye,
  CalendarDays,
  UserCheck
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
      type: string
      label: string
      required: boolean
      options?: string[]
    }>
  } | null
  currentAttendees: number
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

interface EventsClientProps {
  initialEvents: Event[]
  user: User
}

export default function EventsClient({ initialEvents, user }: EventsClientProps) {
  const [events] = useState<Event[]>(initialEvents)

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

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const isRSVPDeadlinePassed = (deadline?: string | null) => {
    if (!deadline) return false
    return new Date() > new Date(deadline)
  }

  const isEventFull = (event: Event) => {
    return event.maxParticipants ? event.currentAttendees >= event.maxParticipants : false
  }

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    
    if (eventDate < now) {
      return { status: 'past', label: 'Past Event', color: 'bg-gray-500' }
    }
    
    if (event.rsvpRequired && event.rsvpDeadline && isRSVPDeadlinePassed(event.rsvpDeadline)) {
      return { status: 'rsvp-closed', label: 'RSVP Closed', color: 'bg-orange-500' }
    }
    
    if (isEventFull(event)) {
      return { status: 'full', label: 'Event Full', color: 'bg-red-500' }
    }
    
    if (event.rsvpRequired) {
      return { status: 'rsvp-open', label: 'RSVP Open', color: 'bg-green-500' }
    }
    
    return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-500' }
  }

  return (
    <div className="space-y-6">
      {/* Admin Create Button */}
      {user.isAdmin && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Events Available</h3>
          <p className="text-muted-foreground">Check back later for upcoming community events.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const eventStatus = getEventStatus(event)
            
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Image */}
                {event.flyer && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.flyer}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${eventStatus.color} text-white`}>
                        {eventStatus.label}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className={event.flyer ? 'pb-2' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.date)}
                      </CardDescription>
                    </div>
                    {!event.flyer && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-muted-foreground">
                          {formatDateShort(event.date)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </p>

                  <p className="text-sm line-clamp-3">{event.description}</p>

                  {/* Event Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{event.currentAttendees} attending</span>
                      {event.maxParticipants && (
                        <span>/ {event.maxParticipants}</span>
                      )}
                    </div>
                    
                    {event.rsvpRequired && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>RSVP Required</span>
                      </div>
                    )}
                  </div>

                  {/* RSVP Deadline */}
                  {event.rsvpRequired && event.rsvpDeadline && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        RSVP by {formatDate(event.rsvpDeadline)}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}