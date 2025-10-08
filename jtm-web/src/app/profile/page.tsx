// JTM Web - Member Profile Page// JTM Web - Member Profile Page// JTM Web - Member Profile Page

import { Suspense } from 'react'

import { getServerSession } from 'next-auth'import { Suspense } from 'react'import { Suspense } from 'react'

import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'import { getServerSession } from 'next-auth'import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'

import MemberLayout from '@/components/layout/MemberLayout'import { redirect } from 'next/navigation'import { redirect } from 'next/navigation'

import MemberProfile from '@/components/profile/MemberProfile'

import { authOptions } from '@/lib/auth'import { authOptions } from '@/lib/auth'

export default async function ProfilePage() {

  const session = await getServerSession(authOptions)import { prisma } from '@/lib/prisma'import { prisma } from '@/lib/prisma'

  

  if (!session?.user?.email) {import MemberLayout from '@/components/layout/MemberLayout'import MemberLayout from '@/components/layout/MemberLayout'

    redirect('/auth/login')

  }import MemberProfile from '@/components/profile/MemberProfile'import MemberProfile from '@/components/profile/MemberProfile'



  // Get user data

  const userData = await prisma.user.findUnique({

    where: { email: session.user.email },export default async function ProfilePage() {export default async function ProfilePage() {

    include: {

      address: true,  const session = await getServerSession(authOptions)  const session = await getServerSession(authOptions)

      familyMembers: true,

      notifications: true,    

    },

  })  if (!session?.user?.email) {  if (!session?.user?.email) {



  if (!userData) {    redirect('/auth/login')    redirect('/auth/login')

    redirect('/auth/login')

  }  }  }



  // Serialize the user data for client component

  const user = {

    id: userData.id,  // Get user data  // Get user data

    firstName: userData.firstName,

    lastName: userData.lastName,  const userData = await prisma.user.findUnique({  const userData = await prisma.user.findUnique({

    email: userData.email,

    mobileNumber: userData.mobileNumber,    where: { email: session.user.email },    where: { email: session.user.email },

    membershipType: userData.membershipType,

    isActive: userData.isActive,    include: {    include: {

    membershipExpiry: userData.membershipExpiry?.toISOString(),

    mustChangePassword: userData.mustChangePassword,      address: true,      address: true,

    address: userData.address,

    familyMembers: userData.familyMembers,      familyMembers: true,      familyMembers: true,

    notifications: userData.notifications,

  }      notifications: true,      notifications: true,



  return (    },    },

    <MemberLayout user={user}>

      <Suspense fallback={<div>Loading profile...</div>}>  })  })

        <MemberProfile user={user} />

      </Suspense>

    </MemberLayout>

  )  if (!userData) {  if (!userData) {

}
    redirect('/auth/login')    redirect('/auth/login')

  }  }



  // Serialize the user data for client component  // Serialize the user data for client component

  const user = {  const user = {

    id: userData.id,    id: userData.id,

    firstName: userData.firstName,    firstName: userData.firstName,

    lastName: userData.lastName,    lastName: userData.lastName,

    email: userData.email,    email: userData.email,

    mobileNumber: userData.mobileNumber,    mobileNumber: userData.mobileNumber,

    membershipType: userData.membershipType,    membershipType: userData.membershipType,

    isActive: userData.isActive,    isActive: userData.isActive,

    membershipExpiry: userData.membershipExpiry?.toISOString(),    membershipExpiry: userData.membershipExpiry?.toISOString(),

    mustChangePassword: userData.mustChangePassword,    mustChangePassword: userData.mustChangePassword,

    address: userData.address ? {    address: userData.address ? {

      street: userData.address.street,      street: userData.address.street,

      city: userData.address.city,      city: userData.address.city,

      state: userData.address.state,      state: userData.address.state,

      zipCode: userData.address.zipCode,      zipCode: userData.address.zipCode,

      country: userData.address.country,      country: userData.address.country,

    } : undefined,    } : undefined,

    familyMembers: userData.familyMembers.map(member => ({    familyMembers: userData.familyMembers.map(member => ({

      id: member.id,      id: member.id,

      firstName: member.firstName,      firstName: member.firstName,

      lastName: member.lastName,      lastName: member.lastName,

      age: member.age,      age: member.age,

      contactNumber: member.contactNumber || undefined,      contactNumber: member.contactNumber,

      email: member.email || undefined,      email: member.email,

      relationship: member.relationship,      relationship: member.relationship,

    })),      address: member.address,

    notifications: userData.notifications ? {    })),

      email: userData.notifications.email,    notifications: userData.notifications ? {

      push: userData.notifications.push,      email: userData.notifications.email,

      eventReminders: userData.notifications.eventReminders,      push: userData.notifications.push,

      membershipRenewal: userData.notifications.membershipRenewal,      eventReminders: userData.notifications.eventReminders,

      adminUpdates: userData.notifications.adminUpdates,      membershipRenewal: userData.notifications.membershipRenewal,

    } : undefined,      adminUpdates: userData.notifications.adminUpdates,

  }    } : undefined,

  }

  return (

    <MemberLayout user={user}>  return (

      <Suspense fallback={<div>Loading profile...</div>}>    <MemberLayout user={user}>

        <MemberProfile user={user} />      <Suspense fallback={<div>Loading profile...</div>}>

      </Suspense>        <MemberProfile user={user} />

    </MemberLayout>      </Suspense>

  )    </MemberLayout>

}  )
}
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