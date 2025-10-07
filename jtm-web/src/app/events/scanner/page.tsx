// JTM Web - QR Scanner Page (Admin Only)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QRScannerClient from '@/components/events/QRScannerClient'

interface QRScannerPageProps {
  searchParams: {
    eventId?: string
  }
}

export default async function QRScannerPage({ searchParams }: QRScannerPageProps) {
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

  // Get event if specified
  let event = null
  if (searchParams.eventId) {
    event = await prisma.event.findUnique({
      where: { id: searchParams.eventId },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
      },
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
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
    </div>
  )
}