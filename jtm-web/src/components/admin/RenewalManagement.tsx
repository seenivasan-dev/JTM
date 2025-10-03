'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react'

interface Renewal {
  id: string
  previousType: string
  newType: string
  paymentReference: string
  status: string
  adminNotes?: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    mobileNumber: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
    }
  }
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

interface RenewalManagementProps {
  initialRenewals: Renewal[]
  pagination: Pagination
  currentStatus: string
}

export default function RenewalManagement({ 
  initialRenewals, 
  pagination, 
  currentStatus 
}: RenewalManagementProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [renewals, setRenewals] = useState(initialRenewals)
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Update URL with new status filter
  const updateStatus = useCallback((newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newStatus && newStatus !== 'all') {
      params.set('status', newStatus)
    } else {
      params.delete('status')
    }
    
    params.delete('page') // Reset to first page when filtering
    
    router.push(`/admin/renewals?${params.toString()}`)
  }, [router, searchParams])

  // Handle renewal processing
  const handleProcessRenewal = async () => {
    if (!selectedRenewal) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/renewals/${selectedRenewal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: processAction,
          adminNotes: adminNotes || undefined
        }),
      })

      if (response.ok) {
        // Update renewal in local state
        setRenewals(prev => 
          prev.map(renewal => 
            renewal.id === selectedRenewal.id 
              ? { 
                  ...renewal, 
                  status: processAction.toUpperCase(),
                  adminNotes: adminNotes || renewal.adminNotes
                }
              : renewal
          )
        )
        
        setShowProcessDialog(false)
        setSelectedRenewal(null)
        setAdminNotes('')
      }
    } catch (error) {
      console.error('Error processing renewal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Open process dialog
  const openProcessDialog = (renewal: Renewal, action: 'approve' | 'reject') => {
    setSelectedRenewal(renewal)
    setProcessAction(action)
    setAdminNotes(renewal.adminNotes || '')
    setShowProcessDialog(true)
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/renewals?${params.toString()}`)
  }

  // Status stats
  const statusCounts = {
    total: renewals.length,
    pending: renewals.filter(r => r.status === 'PENDING').length,
    approved: renewals.filter(r => r.status === 'APPROVED').length,
    rejected: renewals.filter(r => r.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">
      {/* Status Filter and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentStatus} onValueChange={updateStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({statusCounts.total})</SelectItem>
                <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <StatsCard 
          title="Pending" 
          count={statusCounts.pending} 
          icon={Clock} 
          color="text-yellow-600" 
        />
        <StatsCard 
          title="Approved" 
          count={statusCounts.approved} 
          icon={CheckCircle} 
          color="text-green-600" 
        />
        <StatsCard 
          title="Rejected" 
          count={statusCounts.rejected} 
          icon={XCircle} 
          color="text-red-600" 
        />
        <StatsCard 
          title="Total" 
          count={statusCounts.total} 
          icon={FileText} 
          color="text-blue-600" 
        />
      </div>

      {/* Renewals List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Renewal Requests ({pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {renewals.map((renewal) => (
              <RenewalCard
                key={renewal.id}
                renewal={renewal}
                onProcess={openProcessDialog}
                isLoading={isLoading}
              />
            ))}

            {renewals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No renewal requests found for the selected filter.
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} renewals
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Renewal Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? 'Approve' : 'Reject'} Renewal Request
            </DialogTitle>
            <DialogDescription>
              {selectedRenewal && (
                <>
                  Processing renewal for {selectedRenewal.user.firstName} {selectedRenewal.user.lastName}
                  <br />
                  {selectedRenewal.previousType} → {selectedRenewal.newType}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRenewal && (
            <div className="space-y-4">
              {/* Renewal Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Member Details</h4>
                  <p className="text-sm">{selectedRenewal.user.firstName} {selectedRenewal.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRenewal.user.email}</p>
                </div>
                <div>
                  <h4 className="font-medium">Membership Change</h4>
                  <p className="text-sm">
                    {selectedRenewal.previousType} → {selectedRenewal.newType}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payment: {selectedRenewal.paymentReference}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this renewal decision..."
                  rows={3}
                />
              </div>

              {processAction === 'approve' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Approving this renewal will update the member's membership type and extend their membership.
                  </AlertDescription>
                </Alert>
              )}

              {processAction === 'reject' && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Rejecting this renewal will keep the member's current membership status unchanged.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessRenewal} 
              disabled={isLoading}
              variant={processAction === 'approve' ? 'default' : 'destructive'}
            >
              {isLoading ? 'Processing...' : `${processAction === 'approve' ? 'Approve' : 'Reject'} Renewal`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StatsCardProps {
  title: string
  count: number
  icon: any
  color: string
}

function StatsCard({ title, count, icon: Icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  )
}

interface RenewalCardProps {
  renewal: Renewal
  onProcess: (renewal: Renewal, action: 'approve' | 'reject') => void
  isLoading: boolean
}

function RenewalCard({ renewal, onProcess, isLoading }: RenewalCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-semibold text-lg">
              {renewal.user.firstName} {renewal.user.lastName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(renewal.status)}
              <span className="text-sm text-muted-foreground">
                {renewal.previousType} → {renewal.newType}
              </span>
            </div>
          </div>
        </div>

        {renewal.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onProcess(renewal, 'reject')}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onProcess(renewal, 'approve')}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{renewal.user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{renewal.user.mobileNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(renewal.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>Payment: {renewal.paymentReference}</span>
        </div>
        {renewal.user.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{renewal.user.address.city}, {renewal.user.address.state}</span>
          </div>
        )}
      </div>

      {renewal.adminNotes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-1">Admin Notes:</h4>
          <p className="text-sm text-muted-foreground">{renewal.adminNotes}</p>
        </div>
      )}
    </div>
  )
}