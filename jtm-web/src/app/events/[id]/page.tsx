// JTM Web - Event Detail Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventDetailClient from '@/components/events/EventDetailClient'

interface EventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = await params
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

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: userData.email },
  })

  // Get event with RSVP responses
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: {
      rsvpResponses: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          rsvpResponses: true,
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // Check if user has existing RSVP
  const userRsvp = event.rsvpResponses.find(
    rsvp => rsvp.user.email === userData.email
  )

  // Serialize event data
  const serializedEvent = {
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
    rsvpResponses: event.rsvpResponses.map(response => ({
      id: response.id,
      responses: response.responses,
      paymentConfirmed: response.paymentConfirmed,
      qrCode: response.qrCode,
      checkedIn: response.checkedIn,
      user: response.user,
      createdAt: response.createdAt.toISOString(),
    })),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }

  const serializedUserRsvp = userRsvp ? {
    id: userRsvp.id,
    responses: userRsvp.responses,
    paymentConfirmed: userRsvp.paymentConfirmed,
    qrCode: userRsvp.qrCode,
    checkedIn: userRsvp.checkedIn,
    createdAt: userRsvp.createdAt.toISOString(),
  } : null

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetailClient 
          event={serializedEvent}
          user={{ ...userData, isAdmin: !!admin }}
          userRsvp={serializedUserRsvp}
        />
      </Suspense>
    </div>
  )
}