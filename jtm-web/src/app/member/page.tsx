// JTM Web - Member Dashboard Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MemberDashboard from '@/components/member/MemberDashboard'

export default async function MemberPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user data
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      address: true,
      familyMembers: true,
      notifications: true,
    },
  })

  if (!userData) {
    redirect('/auth/login')
  }

  // Check if user must change password
  if (userData.mustChangePassword) {
    redirect('/profile?tab=security&action=change-password')
  }

  // Get recent events
  const eventsData = await prisma.event.findMany({
    take: 5,
    orderBy: { date: 'desc' },
  })

  // Serialize the user data for client component
  const user = {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    membershipType: userData.membershipType,
    isActive: userData.isActive,
    membershipExpiry: userData.membershipExpiry?.toISOString(),
    mustChangePassword: userData.mustChangePassword,
    familyMembers: userData.familyMembers,
    address: userData.address,
  }

  // Serialize events data
  const recentEvents = eventsData.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    rsvpRequired: event.rsvpRequired,
  }))

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <MemberDashboard user={user} recentEvents={recentEvents} />
      </Suspense>
    </div>
  )
}