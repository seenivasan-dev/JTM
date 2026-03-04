'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Calendar,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  QrCode,
  ChevronRight,
  Ticket,
  BookOpen,
  ArrowRight,
  PartyPopper,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

// Thirukural quotes curated for community context
const THIRUKURAL_QUOTES = [
  {
    no: 392,
    tamil: 'கற்றாரைக் கற்றாரே காமுறுவர் கல்லாதார்\nசொற்றாரை வேண்டார் தொழில்',
    english: 'The learned seek the company of the learned; the unlearned shun the words of the wise.',
    chapter: 'The Value of Learning',
  },
  {
    no: 782,
    tamil: 'சுழலினும் ஊதாயம் சூழ்க என்பர் சான்றோர்\nகழல்அகல் கல்லாதவர்',
    english: 'Even in failure, wise ones seek what can be gained — community of the worthy is that gain.',
    chapter: 'The Company of the Good',
  },
  {
    no: 441,
    tamil: 'அன்பு இலார் எல்லாம் தமக்குரியர் அன்புடையார்\nஎன்பும் உரியர் பிறர்க்கு',
    english: 'The loveless keep all to themselves; the loving give even their very bones for others.',
    chapter: 'Love',
  },
  {
    no: 66,
    tamil: 'தந்தை மகற்கு ஆற்றும் நன்றி அவையத்து\nமுந்தி இருக்கச் செயல்',
    english: 'The best gift a parent can give their child is to seat them foremost among the learned.',
    chapter: 'Gratitude',
  },
  {
    no: 107,
    tamil: 'அன்பிற்கும் உண்டோ அடைக்கும் தாழ்;\nஆர்வலர்\nபுன்கணீர் பூசல் தரும்',
    english: 'Can love be locked away? The tears of those who care speak louder than words.',
    chapter: 'Domestic Virtue',
  },
]

interface UpcomingEvent {
  id: string
  title: string
  description: string
  date: string
  location: string
  rsvpRequired: boolean
  paymentRequired: boolean
  currentAttendees: number
  maxParticipants: number | null
  userRsvp: {
    id: string
    paymentConfirmed: boolean
    checkedIn: boolean
    hasQr: boolean
  } | null
}

interface MemberDashboardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    membershipType: string
    isActive: boolean
    membershipExpiry?: string
    mustChangePassword: boolean
    familyMembers: any[]
    address?: any
  }
  upcomingEvents: UpcomingEvent[]
}

function getRsvpBadge(event: UpcomingEvent) {
  if (!event.userRsvp) return null
  const { paymentConfirmed, checkedIn, hasQr } = event.userRsvp
  if (checkedIn) return { label: 'Checked In', color: 'bg-blue-500', icon: ShieldCheck }
  if (paymentConfirmed || (!event.paymentRequired && hasQr))
    return { label: 'Confirmed ✓', color: 'bg-emerald-500', icon: CheckCircle2 }
  if (event.paymentRequired && !paymentConfirmed)
    return { label: 'Payment Pending', color: 'bg-orange-500', icon: Clock }
  return { label: "RSVP'd", color: 'bg-cyan-600', icon: Ticket }
}

export default function MemberDashboard({ user, upcomingEvents }: MemberDashboardProps) {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const membershipExpiryDate = user.membershipExpiry ? new Date(user.membershipExpiry) : null
  const daysUntilExpiry = membershipExpiryDate
    ? Math.ceil((membershipExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30
  const rsvpedCount = upcomingEvents.filter(e => e.userRsvp).length

  // Rotate quote every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(i => (i + 1) % THIRUKURAL_QUOTES.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const quote = THIRUKURAL_QUOTES[quoteIndex]

  return (
    <div className="space-y-6 pb-4">
      {/* ─── Hero Banner with Thirukural ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-700 via-blue-700 to-indigo-800 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10" />
        {/* Decorative Om/kolam circle */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 border border-white/10" />
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 border border-white/10" />

        <div className="relative z-10 p-6 md:p-8">
          {/* Greeting row */}
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                வணக்கம், {user.firstName}!
              </h1>
              <p className="text-cyan-200 text-sm mt-1">
                Jacksonville Tamil Mandram — Member Portal
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/25 text-xs px-3 py-1">
                {user.membershipType}
              </Badge>
              {user.isActive && (
                <Badge className="bg-emerald-500/30 backdrop-blur-sm text-emerald-100 border-emerald-400/30 text-xs px-3 py-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Thirukural Quote Box */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 transition-all duration-500">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gold/30 border border-gold/40 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-yellow-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 font-medium text-sm leading-relaxed whitespace-pre-line">
                  {quote.tamil}
                </p>
                <p className="text-cyan-200 text-xs mt-1 italic leading-relaxed">
                  &ldquo;{quote.english}&rdquo;
                </p>
                <p className="text-white/40 text-xs mt-1.5">
                  குறள் {quote.no} · {quote.chapter}
                </p>
              </div>
            </div>
            {/* Quote dots indicator */}
            <div className="flex gap-1 justify-end mt-3">
              {THIRUKURAL_QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === quoteIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Status Alerts ─── */}
      {!user.isActive && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Your account is pending activation. Please contact an administrator to activate your membership.
          </AlertDescription>
        </Alert>
      )}

      {user.mustChangePassword && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800 flex items-center justify-between flex-wrap gap-3">
            <span>For security, please change your temporary password before accessing other features.</span>
            <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Link href="/profile?tab=security">Change Password Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isExpiringSoon && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800 flex items-center justify-between flex-wrap gap-3">
            <span>
              Your membership expires in <strong>{daysUntilExpiry} days</strong>. Renew now to keep your benefits!
            </span>
            <Button asChild size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              <Link href="/renewal">Renew Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Quick Actions ─── */}
      <div className="grid grid-cols-4 gap-3">
        <Link href="/events" className="group">
          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-100 hover:border-cyan-300 hover:shadow-md transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-cyan-800">Events</span>
          </div>
        </Link>

        <Link href="/profile" className="group">
          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-violet-800">Profile</span>
          </div>
        </Link>

        <Link href="/renewal" className="group">
          <div className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all text-center">
            {!user.isActive && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <RefreshCcw className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-emerald-800">Renew</span>
          </div>
        </Link>

        <Link href="/profile?tab=family" className="group">
          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-orange-800">Family</span>
          </div>
        </Link>
      </div>

      {/* ─── Upcoming Events with RSVP Status ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-600" />
            Upcoming Events
            {rsvpedCount > 0 && (
              <Badge className="bg-cyan-100 text-cyan-800 text-xs ml-1">
                {rsvpedCount} RSVP&apos;d
              </Badge>
            )}
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 -mr-2">
            <Link href="/events" className="flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map(event => {
              const rsvpBadge = getRsvpBadge(event)
              const eventDate = new Date(event.date)
              const isSoon = (eventDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group flex items-start gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-cyan-200 hover:shadow-md transition-all cursor-pointer">
                    {/* Date chip */}
                    <div className="shrink-0 w-12 text-center">
                      <div className={`rounded-xl px-1 py-1.5 ${isSoon ? 'bg-gradient-to-b from-cyan-600 to-indigo-600' : 'bg-gradient-to-b from-gray-600 to-gray-700'}`}>
                        <div className="text-white text-xs font-bold uppercase leading-none">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-white text-xl font-bold leading-tight">
                          {eventDate.getDate()}
                        </div>
                      </div>
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-cyan-700 transition-colors">
                          {event.title}
                        </h3>
                        {rsvpBadge ? (
                          <Badge className={`${rsvpBadge.color} text-white text-xs px-2 py-0.5 shrink-0`}>
                            {rsvpBadge.label}
                          </Badge>
                        ) : event.rsvpRequired ? (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 text-cyan-700 border-cyan-300 shrink-0">
                            Register
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location.split(',')[0]}
                        </span>
                        {event.maxParticipants && (
                          <span className="text-xs text-gray-400">
                            {event.currentAttendees}/{event.maxParticipants} spots
                          </span>
                        )}
                      </div>

                      {/* QR code available indicator */}
                      {event.userRsvp?.hasQr && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <QrCode className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs text-emerald-700 font-medium">QR code in your email</span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 self-center group-hover:text-cyan-400 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-indigo-100 flex items-center justify-center mb-3">
              <PartyPopper className="h-8 w-8 text-cyan-500" />
            </div>
            <p className="text-gray-700 font-semibold">No upcoming events</p>
            <p className="text-gray-500 text-sm mt-1">Check back soon — new events are added regularly</p>
            <Button asChild variant="outline" size="sm" className="mt-4 border-cyan-300 text-cyan-700 hover:bg-cyan-50">
              <Link href="/events">Browse All Events</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ─── Membership Status Card ─── */}
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/5 to-blue-50 border border-primary/15">
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <div className="font-bold text-sm text-primary capitalize">{user.membershipType}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className={`font-bold text-sm ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Expired'}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
              <div className="text-xs text-gray-500 mb-1">Family</div>
              <div className="font-bold text-sm text-orange-600">{user.familyMembers.length + 1}</div>
            </div>
          </div>

          {membershipExpiryDate && (
            <div className="flex items-center justify-between mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Valid until{' '}
                  <strong className="text-gray-800">
                    {membershipExpiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </strong>
                </span>
              </div>
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                <span className={`text-xs font-medium ${daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {daysUntilExpiry}d left
                </span>
              )}
            </div>
          )}

          {!user.isActive && (
            <Button asChild className="w-full mt-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white">
              <Link href="/renewal" className="flex items-center justify-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Renew Membership
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
