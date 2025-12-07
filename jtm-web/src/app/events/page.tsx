// JTM Web - Member Events Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MemberLayout from '@/components/layout/MemberLayout'
import EventsClient from '@/components/events/EventsClient'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user data
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

  // Check if user is admin - redirect to admin events
  const admin = await prisma.admin.findUnique({
    where: { email: userData.email },
  })

  if (admin) {
    redirect('/admin/events')
  }

  // Get upcoming and recent events for members
  const events = await prisma.event.findMany({
    orderBy: {
      date: 'desc',
    },
    include: {
      rsvpResponses: {
        where: {
          userId: userData.id
        }
      },
      _count: {
        select: {
          rsvpResponses: true,
        }
      }
    }
  })

  // Serialize events for member view
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
    hasUserRSVPd: event.rsvpResponses.length > 0,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }))

  return (
    <MemberLayout>
      <Suspense fallback={<div className="p-8">Loading events...</div>}>
        <EventsClient 
          initialEvents={serializedEvents} 
          user={{ ...userData, isAdmin: false }}
        />
      </Suspense>
    </MemberLayout>
  )
}