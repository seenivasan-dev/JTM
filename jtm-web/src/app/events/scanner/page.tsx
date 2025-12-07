// JTM Web - QR Scanner Page (Admin Only)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import QRScannerClient from '@/components/events/QRScannerClient'

interface QRScannerPageProps {
  searchParams: Promise<{
    eventId?: string
  }>
}

export default async function QRScannerPage({ searchParams }: QRScannerPageProps) {
  const { eventId } = await searchParams
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

  const adminInfo = {
    firstName: userData.firstName || 'Admin',
    lastName: userData.lastName || 'User',
    email: session.user.email,
    role: String(admin.role),
  }

  // Get event if specified
  let event = null
  if (eventId) {
    const eventData = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
      },
    })

    if (eventData) {
      event = {
        id: eventData.id,
        title: eventData.title,
        date: eventData.date.toISOString(),
        location: eventData.location,
      }
    }
  }

  return (
    <AdminLayout adminInfo={adminInfo}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">
            Scan attendee QR codes for event check-in
          </p>
        </div>

        <Suspense fallback={<div>Loading scanner...</div>}>
          <QRScannerClient event={event} />
        </Suspense>
      </div>
    </AdminLayout>
  )
}