import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import UserManagement from '@/components/admin/UserManagement'

export default async function AdminUsersPage() {
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

  // Get all users with their membership information
  const users = await prisma.user.findMany({
    orderBy: [
      { createdAt: 'desc' }
    ],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      mobileNumber: true,
      membershipType: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      membershipExpiry: true,
    }
  })

  // Transform the data to match our UserManagement component interface
  const transformedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.mobileNumber || undefined,
    membershipType: user.membershipType,
    membershipStatus: user.isActive ? 'active' : 'inactive',
    joinDate: user.createdAt.toISOString(),
    lastLogin: user.lastLogin?.toISOString(),
    isActive: user.isActive,
    renewalDate: user.membershipExpiry?.toISOString(),
  }))

  return (
    <AdminLayout>
      <UserManagement 
        initialUsers={transformedUsers}
        totalCount={users.length}
      />
    </AdminLayout>
  )
}