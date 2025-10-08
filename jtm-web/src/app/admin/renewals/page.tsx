// JTM Web - Admin Renewals Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
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

  // Get user data for admin info
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      firstName: true,
      lastName: true,
    },
  })

  const adminInfo = {
    firstName: userData?.firstName || 'Admin',
    lastName: userData?.lastName || 'User',
    email: session.user.email,
    role: admin.role,
  }

  // Await searchParams
  const params = await searchParams
  const status = params.status || 'all'
  const page = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '10')

  // Build where clause for filtering
  const where: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  } = {}
  if (status !== 'all') {
    where.status = status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED'
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
    <AdminLayout adminInfo={adminInfo}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Renewal Management
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review and process membership renewal requests
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading renewals...</span>
          </div>
        }>
          <RenewalManagement 
            initialRenewals={renewals}
            pagination={pagination}
            currentStatus={status}
          />
        </Suspense>
      </div>
    </AdminLayout>
  )
}