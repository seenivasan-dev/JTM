// JTM Web - Edit Event Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditEventClient from '@/components/events/EditEventClient'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
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
    redirect('/events')
  }

  // Get event
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: {
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
    rsvpForm: event.rsvpForm as { fields: { id: string; type: "number" | "select" | "text" | "checkbox" | "radio"; label: string; required: boolean; options?: string[] }[] } | null,
    currentAttendees: event._count.rsvpResponses,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading event editor...</div>}>
        <EditEventClient event={serializedEvent} />
      </Suspense>
    </div>
  )
}