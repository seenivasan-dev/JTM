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

  // Get dashboard stats
  const [totalMembers, activeMembers, pendingRenewals, recentRegistrations] = await Promise.all([
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
  ])

  const stats = {
    totalMembers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
    pendingRenewals,
    recentRegistrations,
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {admin.firstName}!</p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard initialStats={stats} />
      </Suspense>
    </div>
  )
}