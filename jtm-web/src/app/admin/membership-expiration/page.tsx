// JTM Web - Admin Membership Expiration Management Page
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MembershipExpirationManagement from '@/components/admin/MembershipExpirationManagement'

export const metadata: Metadata = {
  title: 'Membership Expiration - JTM Admin',
  description: 'Manage automatic membership expiration',
}

export default async function MembershipExpirationPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <div className="p-6">
      <div className="mt-8">
        <MembershipExpirationManagement />
      </div>
    </div>
  )
}
