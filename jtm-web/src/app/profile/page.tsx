// JTM Web - Member Profile Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MemberProfile from '@/components/profile/MemberProfile'

export default async function ProfilePage() {
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

  // Serialize the user data for client component
  const user = {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    mobileNumber: userData.mobileNumber,
    membershipType: userData.membershipType,
    isActive: userData.isActive,
    membershipExpiry: userData.membershipExpiry?.toISOString(),
    mustChangePassword: userData.mustChangePassword,
    address: userData.address ? {
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      <Suspense fallback={<div>Loading profile...</div>}>
        <MemberProfile user={user} />
      </Suspense>
    </div>
  )
}