import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MemberLayout from '@/components/layout/MemberLayout'
import MemberProfile from '@/components/profile/MemberProfile'

export const metadata: Metadata = {
  title: 'My Profile | JTM Community',
  description: 'Manage your profile information and family details',
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

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

  const user = {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    mobileNumber: userData.mobileNumber,
    membershipType: userData.membershipType,
    isActive: userData.isActive,
    mustChangePassword: userData.mustChangePassword,
    membershipExpiry: userData.membershipExpiry?.toISOString() || undefined,
    createdAt: userData.createdAt.toISOString(),
    updatedAt: userData.updatedAt.toISOString(),
    address: userData.address ? {
      id: userData.address.id,
      street: userData.address.street,
      city: userData.address.city,
      state: userData.address.state,
      zipCode: userData.address.zipCode,
      country: userData.address.country,
    } : undefined,
    familyMembers: userData.familyMembers.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      age: member.age,
      contactNumber: member.contactNumber || undefined,
      email: member.email || undefined,
      relationship: member.relationship,
    })),
    notifications: userData.notifications ? {
      email: userData.notifications.email,
      push: userData.notifications.push,
      eventReminders: userData.notifications.eventReminders,
      membershipRenewal: userData.notifications.membershipRenewal,
      adminUpdates: userData.notifications.adminUpdates,
    } : undefined,
  }

  return (
    <MemberLayout>
      <MemberProfile user={user} />
    </MemberLayout>
  )
}
