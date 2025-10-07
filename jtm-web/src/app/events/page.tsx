// JTM Web - Events Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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
    rsvpForm: event.rsvpForm,
    currentAttendees: event._count.rsvpResponses,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }))

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and join upcoming community events</p>
        </div>
      </div>

      <Suspense fallback={<div>Loading events...</div>}>
        <EventsClient 
          initialEvents={serializedEvents} 
          user={{ ...userData, isAdmin: !!admin }}
        />
      </Suspense>
    </div>
  )
}