// JTM Web - Admin Edit Event Page
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditEventClient from '@/components/events/EditEventClient'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/admin')
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { rsvpResponses: true } },
    },
  })

  if (!event) {
    notFound()
  }

  const serializedEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    flyer: event.flyer,
    date: event.date.toISOString(),
    location: event.location,
    rsvpRequired: event.rsvpRequired,
    rsvpDeadline: event.rsvpDeadline?.toISOString() || null,
    maxParticipants: event.maxParticipants,
    rsvpForm: event.rsvpForm as { fields: Array<{ id: string; type: 'text' | 'number' | 'select' | 'checkbox' | 'radio'; label: string; required: boolean; options?: string[] }> } | null,
    foodConfig: event.foodConfig as { enabled: boolean; vegFood: boolean; nonVegFood: boolean; kidsFood: boolean; kidsEatFree: boolean; allowNoFood: boolean } | null,
    paymentRequired: event.paymentRequired,
    qrCheckinEnabled: event.qrCheckinEnabled,
    status: event.status,
    currentAttendees: event._count.rsvpResponses,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }

  return <EditEventClient event={serializedEvent} />
}
