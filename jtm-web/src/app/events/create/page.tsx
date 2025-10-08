// JTM Web - Create Event Page (Admin Only)

import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import CreateEventForm from '@/components/events/CreateEventForm'
import BackButton from '@/components/ui/BackButton'

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
      firstName: true,
      lastName: true,
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

  const adminInfo = {
    firstName: userData?.firstName || 'Admin',
    lastName: userData?.lastName || 'User',
    email: session.user.email,
    role: String(admin.role), // Convert enum to string explicitly
  }

  return (
    <AdminLayout adminInfo={adminInfo}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Create New Event
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Create and configure a new community event with optional RSVP forms
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BackButton />
            </div>
          </div>
        </div>

        {/* Event Creation Form */}
        <div className="max-w-4xl">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading form...</span>
            </div>
          }>
            <CreateEventForm />
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  )
}