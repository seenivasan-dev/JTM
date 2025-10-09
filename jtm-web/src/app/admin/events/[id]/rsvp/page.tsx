// JTM Web - Admin RSVP Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminRSVPManagement from '@/components/admin/AdminRSVPManagement'

interface AdminRSVPPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminRSVPPage({ params }: AdminRSVPPageProps) {
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

  // Serialize the data
  const serializedEvent = {
    id: event.id,
    title: event.title,
    date: event.date.toISOString(),
    location: event.location,
    rsvpForm: event.rsvpForm as {
      fields: Array<{
        id: string
        type: string
        label: string
        required: boolean
        options?: string[]
      }>
    } | undefined
  }

  const serializedRSVPs = event.rsvpResponses.map(rsvp => ({
    id: rsvp.id,
    responses: rsvp.responses as Record<string, any> || {},
    paymentReference: rsvp.paymentReference,
    paymentConfirmed: rsvp.paymentConfirmed,
    qrCode: rsvp.qrCode,
    checkedIn: rsvp.checkedIn,
    checkedInAt: rsvp.checkedInAt?.toISOString() || null,
    createdAt: rsvp.createdAt.toISOString(),
    updatedAt: rsvp.updatedAt.toISOString(),
    user: rsvp.user,
  }))

  return (
    <AdminLayout>
      <Suspense fallback={<div>Loading RSVP responses...</div>}>
        <AdminRSVPManagement 
          event={serializedEvent}
          initialRSVPs={serializedRSVPs}
        />
      </Suspense>
    </AdminLayout>
  )
}