// JTM Web - Admin Layout Wrapper
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayoutMobile'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  // Get admin info for the layout
  const adminInfo = {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
  }

  // Get stats for the layout header
  const [pendingRenewals, upcomingEvents] = await Promise.all([
    prisma.membershipRenewal.count({ where: { status: 'PENDING' } }),
    prisma.event.count({
      where: {
        date: {
          gte: new Date(),
        },
      },
    }),
  ])

  const stats = {
    pendingRenewals,
    newMessages: 0, // Can be updated later with actual notification count
    upcomingEvents,
  }

  return (
    <AdminLayout adminInfo={adminInfo} stats={stats}>
      {children}
    </AdminLayout>
  )
}
