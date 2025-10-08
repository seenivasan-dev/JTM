// JTM Web - Admin Notifications Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import NotificationManagement from '@/components/admin/NotificationManagement'

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/events') // Redirect non-admin users
  }

  // Get notification data and stats
  const [
    totalUsers,
    activeUsers,
    upcomingEvents,
    recentRSVPs,
    pendingRenewals
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.event.count({ 
      where: { 
        date: { gte: new Date() } 
      } 
    }),
    prisma.rSVPResponse.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    }),
    prisma.membershipRenewal.count({
      where: { status: 'PENDING' }
    })
  ])

  const stats = {
    totalUsers,
    activeUsers,
    upcomingEvents,
    recentRSVPs,
    pendingRenewals,
    newMessages: pendingRenewals + recentRSVPs // Simulated notification count
  }

  return (
    <AdminLayout 
      adminInfo={{
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }}
      stats={stats}
    >
      <Suspense fallback={<div>Loading notifications...</div>}>
        <NotificationManagement />
      </Suspense>
    </AdminLayout>
  )
}