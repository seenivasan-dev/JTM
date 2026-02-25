// JTM Web - Events Page (public + member access)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MemberLayout from '@/components/layout/MemberLayout'
import EventsClient from '@/components/events/EventsClient'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)

  // Redirect admins to admin events page
  if (session?.user?.email) {
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })
    if (admin) {
      redirect('/admin/events')
    }
  }

  // Fetch member data only when logged in
  let userData = null
  if (session?.user?.email) {
    userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        membershipType: true,
      },
    })
  }

  // Fetch events — include user RSVP data only for logged-in members
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: {
      rsvpResponses: userData
        ? { where: { userId: userData.id } }
        : false,
      _count: { select: { rsvpResponses: true } },
    },
  })

  const serializedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    flyer: event.flyer,
    date: event.date.toISOString(),
    location: event.location,
    rsvpRequired: event.rsvpRequired,
    rsvpDeadline: event.rsvpDeadline?.toISOString() || null,
    maxParticipants: event.maxParticipants,
    rsvpForm: event.rsvpForm as { fields: { id: string; type: string; label: string; required: boolean; options?: string[] }[] } | null,
    currentAttendees: event._count.rsvpResponses,
    hasUserRSVPd: Array.isArray((event as any).rsvpResponses) ? (event as any).rsvpResponses.length > 0 : false,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }))

  return (
    <MemberLayout>
      <Suspense fallback={<div className="p-8">Loading events...</div>}>
        <EventsClient
          initialEvents={serializedEvents}
          user={userData ? { ...userData, isAdmin: false } : null}
        />
      </Suspense>
    </MemberLayout>
  )
}
