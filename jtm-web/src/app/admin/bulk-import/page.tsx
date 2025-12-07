// JTM Web - Admin Bulk Import Page
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BulkImportComponent from '@/components/admin/BulkImportComponent'

export const metadata: Metadata = {
  title: 'Bulk Import | Admin Dashboard',
  description: 'Import multiple members from Excel/CSV files',
}

export default async function BulkImportPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user?.email || '' },
  })

  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <BulkImportComponent />
  )
}