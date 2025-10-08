// JTM Web - Create Event Page (Admin Only)

import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventLayout from '@/components/layout/EventLayout'
import CreateEventForm from '@/components/events/CreateEventForm'

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user data
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
    },
  })

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      role: true,
    },
  })

  if (!admin) {
    redirect('/events') // Redirect non-admin users to events page
  }

  return (
    <EventLayout
      userRole="admin"
      title="Create New Event"
      showBackButton={true}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <CreateEventForm />
          </Suspense>
        </div>
      </div>
    </EventLayout>
  )
}