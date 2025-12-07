// JTM Web - Main Dashboard Page (Router)
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  // Get user data to check expiration status
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isActive: true, membershipExpiry: true },
  })

  // Redirect based on role and status
  if (admin) {
    redirect('/admin')
  } else if (user && !user.isActive) {
    // Expired membership - redirect to renewal page
    redirect('/renewal')
  } else {
    redirect('/member')
  }
}