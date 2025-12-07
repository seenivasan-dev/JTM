// JTM Web - Admin Membership Expiration Management Page
import { Metadata } from 'next'
import MembershipExpirationManagement from '@/components/admin/MembershipExpirationManagement'
import { PageHeader } from '@/components/ui/page-header'

export const metadata: Metadata = {
  title: 'Membership Expiration - JTM Admin',
  description: 'Manage automatic membership expiration',
}

export default function MembershipExpirationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Membership Expiration"
        description="View and manage automatic membership expiration settings"
      />
      
      <div className="mt-8">
        <MembershipExpirationManagement />
      </div>
    </div>
  )
}
