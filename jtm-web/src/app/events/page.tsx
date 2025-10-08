// JTM Web - Events Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventLayout from '@/components/layout/EventLayout'
import EventsClient from '@/components/events/EventsClient'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user data and admin status
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      membershipType: true,
    },
  })

  if (!userData) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: userData.email },
  })

  // Get events from database
  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(), // Only future events
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      _count: {
        select: {
          rsvpResponses: true,
        },
      },
    },
  })

  // Serialize events data
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
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }))

  return (
    <EventLayout 
      userRole={admin ? 'admin' : 'member'}
      title="Community Events"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading events...</div>}>
          <EventsClient 
            initialEvents={serializedEvents} 
            user={{ ...userData, isAdmin: !!admin }}
          />
        </Suspense>
      </div>
    </EventLayout>
  )
}