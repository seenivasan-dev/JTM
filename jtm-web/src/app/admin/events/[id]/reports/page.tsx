import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RSVPReports from '@/components/admin/RSVPReports'

interface RSVPReportsPageProps {
  params: Promise<{ id: string }>
}

export default async function RSVPReportsPage({ params }: RSVPReportsPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/admin')
  }

  // Get event with RSVP responses
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: {
      rsvpResponses: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              membershipType: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  // Get admin info for layout
  const adminInfo = {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role
  }

  // Get stats for layout
  const [pendingRenewals, upcomingEvents] = await Promise.all([
    prisma.membershipRenewal.count({
      where: { status: 'PENDING' }
    }),
    prisma.event.count({
      where: {
        date: {
          gte: new Date()
        }
      }
    })
  ])

  const stats = {
    pendingRenewals,
    upcomingEvents
  }

  // Serialize the data
  const serializedEvent = {
    id: event.id,
    title: event.title,
    date: event.date.toISOString(),
    location: event.location,
    maxParticipants: event.maxParticipants,
    rsvpDeadline: event.rsvpDeadline?.toISOString() || null,
  }

  const serializedRSVPs = event.rsvpResponses.map(rsvp => ({
    id: rsvp.id,
    responses: rsvp.responses as Record<string, any> || {},
    paymentReference: rsvp.paymentReference,
    paymentConfirmed: rsvp.paymentConfirmed,
    checkedIn: rsvp.checkedIn,
    checkedInAt: rsvp.checkedInAt?.toISOString() || null,
    createdAt: rsvp.createdAt.toISOString(),
    user: rsvp.user,
  }))

  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <RSVPReports 
          event={serializedEvent}
          rsvps={serializedRSVPs}
        />
      </Suspense>
  )
}
