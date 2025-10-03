// JTM Web - Admin Renewals Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RenewalManagement from '@/components/admin/RenewalManagement'

interface SearchParams {
  status?: string
  page?: string
  limit?: string
}

export default async function AdminRenewalsPage({
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

  const status = searchParams.status || 'all'
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '10')

  // Build where clause for filtering
  const where: any = {}
  if (status !== 'all') {
    where.status = status.toUpperCase()
  }

  // Get renewals with pagination
  const [renewals, totalCount] = await Promise.all([
    prisma.membershipRenewal.findMany({
      where,
      include: {
        user: {
          include: {
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.membershipRenewal.count({ where }),
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
        <h1 className="text-3xl font-bold">Renewal Management</h1>
      </div>

      <Suspense fallback={<div>Loading renewals...</div>}>
        <RenewalManagement 
          initialRenewals={renewals}
          pagination={pagination}
          currentStatus={status}
        />
      </Suspense>
    </div>
  )
}