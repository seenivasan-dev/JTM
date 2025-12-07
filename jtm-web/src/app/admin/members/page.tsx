// JTM Web - Admin Members Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MembershipType, Prisma } from '@prisma/client'
import AdminLayout from '@/components/admin/AdminLayout'
import MemberManagement from '@/components/admin/MemberManagement'

interface SearchParams {
  search?: string
  status?: string
  membershipType?: string
  page?: string
  limit?: string
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
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
    redirect('/dashboard')
  }

  // Await searchParams
  const params = await searchParams
  const search = params.search || ''
  const status = params.status || 'all'
  const membershipType = params.membershipType || 'all'
  const page = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '10')

  // Build where clause for filtering
  const where: Prisma.UserWhereInput = {}

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status !== 'all') {
    where.isActive = status === 'active'
  }

  if (membershipType !== 'all') {
    where.membershipType = membershipType.toUpperCase() as MembershipType
  }

  // Get members with pagination
  const [membersData, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        address: true,
        familyMembers: true,
        _count: {
          select: {
            familyMembers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  // Serialize members data for client component
  const members = membersData.map(member => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    mobileNumber: member.mobileNumber,
    membershipType: member.membershipType,
    isActive: member.isActive,
    createdAt: member.createdAt.toISOString(),
    address: member.address ? {
      street: member.address.street,
      city: member.address.city,
      state: member.address.state,
      zipCode: member.address.zipCode,
    } : undefined,
    _count: {
      familyMembers: member._count.familyMembers,
    },
  }))

  const totalPages = Math.ceil(totalCount / limit)

  const pagination = {
    page,
    limit,
    totalCount,
    totalPages,
  }

  const adminInfo = {
    firstName: admin.firstName || 'Admin',
    lastName: admin.lastName || 'User',
    email: session.user.email,
    role: String(admin.role),
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              <span className="ml-3 text-lg text-muted-foreground">Loading members...</span>
            </div>
          </div>
        }>
          <MemberManagement 
            initialMembers={members}
            pagination={pagination}
            filters={{ search, status, membershipType }}
          />
      </Suspense>
    </div>
  )
}