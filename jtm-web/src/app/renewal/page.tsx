// JTM Web - Member Renewal Page
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MemberRenewalRequest from '@/components/renewal/MemberRenewalRequest'

export const metadata: Metadata = {
  title: 'Membership Renewal | JTM Community',
  description: 'Renew your community membership for the current year',
}

export default async function RenewalPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user data with family members
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      familyMembers: true,
      renewalRequests: {
        where: {
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
  })

  if (!userData) {
    redirect('/auth/login')
  }

  // Check if user is admin (admins don't need to renew)
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (admin) {
    redirect('/admin/renewals')
  }

  // Serialize the user data
  const user = {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    membershipType: userData.membershipType,
    membershipExpiry: userData.membershipExpiry?.toISOString(),
    familyMembers: userData.familyMembers.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      age: member.age,
      relationship: member.relationship,
    })),
  }

  // Get pending renewal if exists
  const pendingRenewal = userData.renewalRequests.length > 0 ? {
    id: userData.renewalRequests[0].id,
    newType: userData.renewalRequests[0].newType,
    paymentReference: userData.renewalRequests[0].paymentReference,
    status: userData.renewalRequests[0].status,
    createdAt: userData.renewalRequests[0].createdAt.toISOString(),
  } : undefined

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Membership Renewal</h1>
          <p className="text-muted-foreground mt-2">
            Renew your membership to continue enjoying all community benefits and events.
          </p>
        </div>

        <MemberRenewalRequest user={user} pendingRenewal={pendingRenewal} />
      </div>
    </div>
  )
}