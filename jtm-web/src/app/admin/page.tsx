// JTM Web - Admin Dashboard Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/dashboard') // Redirect to member dashboard
  }

  // Get comprehensive dashboard stats including events and RSVPs
  const [
    totalMembers, 
    activeMembers, 
    pendingRenewals, 
    recentRegistrations,
    totalEvents,
    upcomingEvents,
    totalRSVPs,
    pendingRSVPs,
    checkedInRSVPs
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.membershipRenewal.count({ where: { status: 'PENDING' } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    prisma.event.count(),
    prisma.event.count({
      where: {
        date: {
          gte: new Date(), // Future events
        },
      },
    }),
    prisma.rSVPResponse.count(),
    prisma.rSVPResponse.count({ where: { paymentConfirmed: false } }),
    prisma.rSVPResponse.count({ where: { checkedIn: true } }),
  ])

  const stats = {
    totalMembers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
    pendingRenewals,
    recentRegistrations,
    totalEvents,
    upcomingEvents,
    totalRSVPs,
    pendingRSVPs,
    checkedInRSVPs,
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard initialStats={stats} />
    </Suspense>
  )
}