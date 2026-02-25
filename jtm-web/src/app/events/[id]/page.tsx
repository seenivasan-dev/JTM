// JTM Web - Event Detail Page (public + member access)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MemberLayout from '@/components/layout/MemberLayout'
import AdminLayout from '@/components/admin/AdminLayout'
import EventDetailClient from '@/components/events/EventDetailClient'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

function serializeEvent(event: any) {
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
    rsvpForm: event.rsvpForm as { fields: { id: string; type: 'number' | 'select' | 'text' | 'checkbox' | 'radio'; label: string; required: boolean; options?: string[] }[] } | null,
    foodConfig: event.foodConfig ?? null,
    currentAttendees: event._count.rsvpResponses,
    rsvpResponses: Array.isArray(event.rsvpResponses)
      ? event.rsvpResponses.map((r: any) => ({
          id: r.id,
          responses: r.responses as Record<string, string | number | boolean> || {},
          paymentConfirmed: r.paymentConfirmed,
          qrCode: r.qrCode,
          checkedIn: r.checkedIn,
          user: r.user,
          createdAt: r.createdAt.toISOString(),
        }))
      : [],
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  let userData = null
  let isAdmin = false

  if (session?.user?.email) {
    userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, firstName: true, lastName: true, email: true, membershipType: true },
    })

    if (userData) {
      const admin = await prisma.admin.findUnique({ where: { email: userData.email } })
      isAdmin = !!admin

      if (isAdmin) {
        const event = await prisma.event.findUnique({
          where: { id: resolvedParams.id },
          include: {
            rsvpResponses: {
              include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
            },
            _count: { select: { rsvpResponses: true } },
          },
        })
        if (!event) notFound()

        const adminInfo = {
          firstName: userData.firstName || 'Admin',
          lastName: userData.lastName || 'User',
          email: session.user.email,
          role: 'ADMIN',
        }

        return (
          <AdminLayout adminInfo={adminInfo}>
            <Suspense fallback={<div className="p-8">Loading event details...</div>}>
              <EventDetailClient
                event={serializeEvent(event)}
                user={{ ...userData, isAdmin: true }}
                userRsvp={null}
              />
            </Suspense>
          </AdminLayout>
        )
      }
    }
  }

  // Member or public access
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: {
      rsvpResponses: userData
        ? {
            where: { userId: userData.id },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          }
        : false,
      _count: { select: { rsvpResponses: true } },
    },
  })

  if (!event) notFound()

  const rsvpList = Array.isArray((event as any).rsvpResponses) ? (event as any).rsvpResponses : []
  const userRsvpRaw = userData ? rsvpList.find((r: any) => r.user?.email === userData?.email) ?? null : null

  const serializedUserRsvp = userRsvpRaw
    ? {
        id: userRsvpRaw.id,
        responses: userRsvpRaw.responses as Record<string, string | number | boolean> || {},
        paymentConfirmed: userRsvpRaw.paymentConfirmed,
        qrCode: userRsvpRaw.qrCode,
        checkedIn: userRsvpRaw.checkedIn,
        createdAt: userRsvpRaw.createdAt.toISOString(),
        vegCount: userRsvpRaw.vegCount ?? 0,
        nonVegCount: userRsvpRaw.nonVegCount ?? 0,
        kidsCount: userRsvpRaw.kidsCount ?? 0,
        noFood: userRsvpRaw.noFood ?? false,
      }
    : null

  const serializedEvent = { ...serializeEvent(event), rsvpResponses: [] }

  return (
    <MemberLayout>
      <Suspense fallback={<div className="p-8">Loading event details...</div>}>
        <EventDetailClient
          event={serializedEvent}
          user={userData ? { ...userData, isAdmin: false } : null}
          userRsvp={serializedUserRsvp}
        />
      </Suspense>
    </MemberLayout>
  )
}
