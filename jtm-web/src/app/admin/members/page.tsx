// JTM Web - Admin Members Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
  searchParams: SearchParams
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

  const search = searchParams.search || ''
  const status = searchParams.status || 'all'
  const membershipType = searchParams.membershipType || 'all'
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '10')

  // Build where clause for filtering
  const where: any = {}

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
    where.membershipType = membershipType.toUpperCase()
  }

  // Get members with pagination
  const [members, totalCount] = await Promise.all([
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

  const totalPages = Math.ceil(totalCount / limit)

  const pagination = {
    page,
    limit,
    totalCount,
    totalPages,
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Member Management</h1>
      </div>

      <Suspense fallback={<div>Loading members...</div>}>
        <MemberManagement 
          initialMembers={members}
          pagination={pagination}
          filters={{ search, status, membershipType }}
        />
      </Suspense>
    </div>
  )
}