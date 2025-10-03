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
  const status = params.status || 'all'
  const page = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '10')

  // Build where clause for filtering
  const where: any = {}
  if (status !== 'all') {
    where.status = status.toUpperCase()
  }

  // Get renewals with pagination
  const [renewalsData, totalCount] = await Promise.all([
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

  // Serialize renewals data for client component
  const renewals = renewalsData.map(renewal => ({
    id: renewal.id,
    previousType: renewal.previousType,
    newType: renewal.newType,
    paymentReference: renewal.paymentReference,
    status: renewal.status,
    adminNotes: renewal.adminNotes || undefined,
    createdAt: renewal.createdAt.toISOString(),
    user: {
      id: renewal.user.id,
      firstName: renewal.user.firstName,
      lastName: renewal.user.lastName,
      email: renewal.user.email,
      mobileNumber: renewal.user.mobileNumber,
      address: renewal.user.address ? {
        street: renewal.user.address.street,
        city: renewal.user.address.city,
        state: renewal.user.address.state,
        zipCode: renewal.user.address.zipCode,
      } : undefined,
    },
  }))

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