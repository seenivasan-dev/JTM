// JTM Web - Events Page (public + member access)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MemberLayout from '@/components/layout/MemberLayout'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicBottomNav } from '@/components/layout/PublicBottomNav'
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
        ? {
            where: { userId: userData.id },
            select: {
              id: true,
              paymentConfirmed: true,
              vegCount: true,
              nonVegCount: true,
              kidsCount: true,
              noFood: true,
            },
          }
        : false,
      _count: { select: { rsvpResponses: true } },
    },
  })

  const serializedEvents = events.map(event => {
    const rsvpArr = Array.isArray((event as any).rsvpResponses) ? (event as any).rsvpResponses : []
    const rsvpData = rsvpArr.length > 0 ? rsvpArr[0] : null
    return {
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
      hasUserRSVPd: rsvpArr.length > 0,
      userRsvpSummary: rsvpData ? {
        paymentConfirmed: rsvpData.paymentConfirmed as boolean,
        vegCount: (rsvpData.vegCount as number) ?? 0,
        nonVegCount: (rsvpData.nonVegCount as number) ?? 0,
        kidsCount: (rsvpData.kidsCount as number) ?? 0,
        noFood: (rsvpData.noFood as boolean) ?? false,
      } : null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }
  })

  if (userData) {
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

  return (
    <>
      <PublicNav />
      <div className="pt-20 pb-20 lg:pb-0 min-h-screen bg-gray-50">
        <Suspense fallback={<div className="p-8">Loading events...</div>}>
          <EventsClient
            initialEvents={serializedEvents}
            user={null}
          />
        </Suspense>
      </div>
      <PublicBottomNav />
    </>
  )
}
