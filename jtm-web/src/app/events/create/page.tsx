// JTM Web - Create Event Page (Admin Only)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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

  if (!userData) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: userData.email },
  })

  if (!admin) {
    redirect('/events') // Redirect non-admin users
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">
            Create and manage community events with optional RSVP forms
          </p>
        </div>

        <Suspense fallback={<div>Loading form...</div>}>
          <CreateEventForm />
        </Suspense>
      </div>
    </div>
  )
}