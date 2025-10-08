// JTM Web - Home Page (Redirects to Login)
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (admin) {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}
