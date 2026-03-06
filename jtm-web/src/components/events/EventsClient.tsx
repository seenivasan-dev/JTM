'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Eye,
  CalendarDays,
  CheckCircle,
  PartyPopper
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface UserRsvpSummary {
  paymentConfirmed: boolean
  vegCount: number
  nonVegCount: number
  kidsCount: number
  noFood: boolean
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
  userRsvpSummary?: UserRsvpSummary | null
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
  user: User | null
}

export default function EventsClient({ initialEvents, user }: EventsClientProps) {
  const [events] = useState<Event[]>(initialEvents)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const isRSVPDeadlinePassed = (deadline?: string | null) => {
    if (!deadline) return false
    return new Date() > new Date(deadline)
  }

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    if (eventDate < now) return { status: 'past', label: 'Past', color: 'bg-gray-500' }
    if (event.rsvpRequired && event.rsvpDeadline && isRSVPDeadlinePassed(event.rsvpDeadline))
      return { status: 'rsvp-closed', label: 'RSVP Closed', color: 'bg-orange-500' }
    if (event.maxParticipants && event.currentAttendees >= event.maxParticipants)
      return { status: 'full', label: 'Full', color: 'bg-red-500' }
    if (event.rsvpRequired) return { status: 'rsvp-open', label: 'RSVP Open', color: 'bg-green-500' }
    return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-500' }
  }

  const upcomingCount = events.filter(e => getEventStatus(e).status !== 'past').length
  const pastCount = events.filter(e => getEventStatus(e).status === 'past').length

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    const status = getEventStatus(event).status
    return filter === 'past' ? status === 'past' : status !== 'past'
  })

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-1 flex items-center gap-2">
              <PartyPopper className="h-7 w-7" />
              Community Events
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Celebrating Tamil culture and traditions
            </p>
          </div>
          {user?.isAdmin && (
            <Button asChild className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-xl">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'upcoming' | 'past')}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">
            All <span className="ml-1.5 text-xs opacity-60">({events.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
            Upcoming <span className="ml-1.5 text-xs opacity-60">({upcomingCount})</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 sm:flex-none">
            Past <span className="ml-1.5 text-xs opacity-60">({pastCount})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-10 w-10 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Events Found</h3>
          <p className="text-gray-500 text-sm">
            {filter === 'upcoming' ? 'No upcoming events yet. Check back soon!'
              : filter === 'past' ? 'No past events to show.'
              : 'Check back later for upcoming community events.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event)
            const rsvp = event.userRsvpSummary
            const totalGuests = rsvp ? (rsvp.vegCount + rsvp.nonVegCount + rsvp.kidsCount) : 0
            const hasFoodData = rsvp && (rsvp.vegCount > 0 || rsvp.nonVegCount > 0 || rsvp.kidsCount > 0 || rsvp.noFood)

            return (
              <div key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-cyan-100 transition-all duration-300 flex flex-col">

                {/* ── Image area ── */}
                <div className="relative h-52 flex-shrink-0 overflow-hidden">
                  {event.flyer ? (
                    <Image
                      src={event.flyer}
                      alt={event.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-700">
                      <div className="absolute inset-0 bg-kolam-pattern opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`${eventStatus.color} text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow`}>
                      {eventStatus.label}
                    </span>
                  </div>

                  {/* RSVP badge */}
                  {event.hasUserRSVPd && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        RSVP&apos;d
                      </span>
                    </div>
                  )}

                  {/* Date chip — bottom-left of image */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md flex items-center gap-2.5">
                      <div className="text-center">
                        <div className="text-xl font-black text-gray-900 leading-tight">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div className="border-l border-gray-200 pl-2.5">
                        <div className="text-xs font-bold text-gray-700">
                          {new Date(event.date).toLocaleString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-col flex-1 p-4 space-y-3">
                  {/* Title + location */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-gray-400 text-xs">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">{event.description}</p>

                  {/* Attendees row */}
                  <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <Users className="h-3.5 w-3.5" />
                      {event.currentAttendees}
                      {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} attending
                    </div>
                    {event.rsvpRequired && (
                      <span className="text-cyan-600 bg-cyan-50 font-semibold px-2 py-0.5 rounded-full">
                        RSVP Required
                      </span>
                    )}
                  </div>

                  {/* RSVP deadline */}
                  {event.rsvpRequired && event.rsvpDeadline && !isRSVPDeadlinePassed(event.rsvpDeadline) && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      RSVP by {new Date(event.rsvpDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}

                  {/* ── RSVP Summary (only when user has RSVP'd) ── */}
                  {event.hasUserRSVPd && rsvp && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-2.5 w-2.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-emerald-800">
                          {rsvp.paymentConfirmed ? 'RSVP Confirmed ✓' : 'Awaiting Confirmation'}
                        </span>
                      </div>
                      {hasFoodData && (
                        <div className="flex flex-wrap gap-1.5">
                          {rsvp.vegCount > 0 && (
                            <span className="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                              🥗 Veg ×{rsvp.vegCount}
                            </span>
                          )}
                          {rsvp.nonVegCount > 0 && (
                            <span className="text-[11px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                              🍗 Non-Veg ×{rsvp.nonVegCount}
                            </span>
                          )}
                          {rsvp.kidsCount > 0 && (
                            <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                              👶 Kids ×{rsvp.kidsCount}
                            </span>
                          )}
                          {rsvp.noFood && (
                            <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                              No Food
                            </span>
                          )}
                          {totalGuests > 0 && (
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                              👥 {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <Button asChild className="w-full mt-auto bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
                    <Link href={`/events/${event.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      {event.hasUserRSVPd ? 'View My RSVP' : 'View Details'}
                    </Link>
                  </Button>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
