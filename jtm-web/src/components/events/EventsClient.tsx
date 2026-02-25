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
  UserCheck,
  Sparkles,
  PartyPopper
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
  hasUserRSVPd?: boolean
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
    <div className="space-y-8">
      {/* Tamil Cultural Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2 flex items-center gap-2">
                <PartyPopper className="h-8 w-8" />
                Community Events
              </h1>
              <p className="text-white drop-shadow-md text-lg">
                Join us in celebrating Tamil culture and traditions
              </p>
            </div>
            {user.isAdmin && (
              <Button asChild className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white drop-shadow-md border-white/30">
                <Link href="/events/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CalendarDays className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Available</h3>
          <p className="text-gray-600">Check back later for upcoming community events and celebrations.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const eventStatus = getEventStatus(event)
            
            return (
              <Card key={event.id} className="elevated-card group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-primary/20">
                {/* Event Image */}
                {event.flyer && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={event.flyer}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className={`${eventStatus.color} text-white shadow-lg backdrop-blur-sm`}>
                        {eventStatus.label}
                      </Badge>
                    </div>
                    {event.hasUserRSVPd && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          RSVP Confirmed
                        </Badge>
                      </div>
                    )}
                    {!event.flyer && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="p-3 bg-white/90 backdrop-blur-sm rounded-lg">
                          <div className="text-2xl font-bold text-primary text-center">
                            {formatDateShort(event.date)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!event.flyer && (
                  <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-kolam-pattern opacity-5"></div>
                    <div className="relative z-10 text-center">
                      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg inline-block">
                        <div className="text-4xl font-bold text-primary mb-1">
                          {formatDateShort(event.date).split(',')[0]}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'long' })}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className={`${eventStatus.color} text-white shadow-lg`}>
                        {eventStatus.label}
                      </Badge>
                    </div>
                    {event.hasUserRSVPd && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          RSVP Confirmed
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-gray-700">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="p-1.5 bg-secondary/10 rounded-md mt-0.5">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="flex-1">{event.location}</span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{event.description}</p>

                  {/* Event Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-accent/10 rounded-md">
                        <Users className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {event.currentAttendees}
                        {event.maxParticipants && ` / ${event.maxParticipants}`}
                      </span>
                    </div>
                    
                    {event.rsvpRequired && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-gold/10 rounded-md">
                          <UserCheck className="h-4 w-4 text-gold" />
                        </div>
                        <span className="font-medium text-gray-700">RSVP</span>
                      </div>
                    )}
                  </div>

                  {/* RSVP Deadline */}
                  {event.rsvpRequired && event.rsvpDeadline && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-orange-50 p-2 rounded-lg">
                      <Clock className="h-3 w-3 text-orange-600" />
                      <span>
                        RSVP by {new Date(event.rsvpDeadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white shadow-lg group-hover:shadow-xl transition-all">
                    <Link href={`/events/${event.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}