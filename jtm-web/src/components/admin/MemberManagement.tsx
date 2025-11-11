'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/ui/page-header'
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  membershipType: string
  isActive: boolean
  createdAt: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  _count: {
    familyMembers: number
  }
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

interface Filters {
  search: string
  status: string
  membershipType: string
}

interface MemberManagementProps {
  initialMembers: Member[]
  pagination: Pagination
  filters: Filters
}

export default function MemberManagement({ 
  initialMembers, 
  pagination, 
  filters 
}: MemberManagementProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [members, setMembers] = useState(initialMembers)
  const [currentPagination, setCurrentPagination] = useState(pagination)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate')
  const [searchValue, setSearchValue] = useState(filters.search)
  const [statusFilter, setStatusFilter] = useState(filters.status)
  const [membershipTypeFilter, setMembershipTypeFilter] = useState(filters.membershipType)

  // Update state when props change (pagination, filters, or new data)
  useEffect(() => {
    setMembers(initialMembers)
    setCurrentPagination(pagination)
    setSearchValue(filters.search)
    setStatusFilter(filters.status)
    setMembershipTypeFilter(filters.membershipType)
    // Clear selection when data changes
    setSelectedMembers([])
  }, [initialMembers, pagination, filters])

  // Debounced search functionality
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const debouncedSearch = useCallback((value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      updateFilters({ search: value })
    }, 500) // 500ms delay
    
    setSearchTimeout(timeout)
  }, [searchTimeout])

  // Update URL with new filters - with immediate refresh
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.delete('page') // Reset to first page when filtering
    
    router.push(`/admin/members?${params.toString()}`)
    // Force a refresh to get fresh data immediately
    router.refresh()
  }, [router, searchParams])

  // Get selected members info for smart bulk actions
  const selectedMembersInfo = members.filter(member => selectedMembers.includes(member.id))
  const selectedActiveCount = selectedMembersInfo.filter(member => member.isActive).length
  const selectedInactiveCount = selectedMembersInfo.filter(member => !member.isActive).length

  // Clear loading state when data updates
  useEffect(() => {
    setIsLoading(false)
  }, [members, currentPagination])

  // Handle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const selectAllMembers = () => {
    setSelectedMembers(members.map(m => m.id))
  }

  const clearSelection = () => {
    setSelectedMembers([])
  }

  // Handle individual member actions
  const handleMemberAction = async (memberId: string, action: 'activate' | 'deactivate' | 'delete' | 'view') => {
    if (action === 'view') {
      // Navigate to member detail view
      router.push(`/admin/members/${memberId}`)
      return
    }

    if (action === 'delete') {
      if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
        return
      }
    }

    setIsLoading(true)
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/users/${memberId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove member from local state
          setMembers(prev => prev.filter(member => member.id !== memberId))
          setSelectedMembers(prev => prev.filter(id => id !== memberId))
        }
      } else {
        const response = await fetch(`/api/users/${memberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: action === 'activate' }),
        })

        if (response.ok) {
          // Update member in local state
          setMembers(prev => 
            prev.map(member => 
              member.id === memberId 
                ? { ...member, isActive: action === 'activate' }
                : member
            )
          )
        }
      }
    } catch (error) {
      console.error('Error updating member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle bulk actions
  const handleBulkAction = async () => {
    setIsLoading(true)
    try {
      if (bulkAction === 'activate' || bulkAction === 'deactivate') {
        const response = await fetch('/api/users/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: bulkAction,
            userIds: selectedMembers 
          }),
        })

        if (response.ok) {
          const result = await response.json()
          
          // Update members in local state
          setMembers(prev =>
            prev.map(member =>
              selectedMembers.includes(member.id)
                ? { ...member, isActive: bulkAction === 'activate' }
                : member
            )
          )
          clearSelection()
          
          // Show success message (you can add a toast here)
          console.log(result.message)
        } else {
          const error = await response.json()
          console.error('Bulk action failed:', error.error)
        }
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setIsLoading(false)
      setShowBulkDialog(false)
    }
  }

  // Pagination handlers - with immediate refresh
  const goToPage = useCallback((page: number) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/members?${params.toString()}`)
    // Force a refresh to get fresh data immediately
    router.refresh()
  }, [router, searchParams])

  const stats = {
    total: currentPagination.totalCount,
    active: members.filter(m => m.isActive).length,
    inactive: members.filter(m => !m.isActive).length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Management"
        description={`Manage all ${stats.total} members • ${stats.active} active, ${stats.inactive} inactive`}
        action={
          selectedMembers.length > 0 ? (
            <Button onClick={() => setShowBulkDialog(true)} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedMembers.length})
            </Button>
          ) : null
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value)
                    debouncedSearch(e.target.value)
                  }}
                />
              </div>
            </div>
            
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value)
                updateFilters({ status: value })
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={membershipTypeFilter} 
              onValueChange={(value) => {
                setMembershipTypeFilter(value)
                updateFilters({ membershipType: value })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Membership Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMembers.length > 0 && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {selectedMembers.length} member(s) selected
              {selectedActiveCount > 0 && selectedInactiveCount > 0 && (
                <span className="text-muted-foreground ml-2">
                  ({selectedActiveCount} active, {selectedInactiveCount} inactive)
                </span>
              )}
            </span>
            <div className="flex gap-2">
              {selectedInactiveCount > 0 && (
                <Button 
                  size="sm" 
                  onClick={() => { setBulkAction('activate'); setShowBulkDialog(true) }}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Activate ({selectedInactiveCount})
                </Button>
              )}
              {selectedActiveCount > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => { setBulkAction('deactivate'); setShowBulkDialog(true) }}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Deactivate ({selectedActiveCount})
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Members ({pagination.totalCount})
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAllMembers}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-muted-foreground">Loading members...</span>
              </div>
            )}
            
            {!isLoading && members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No members found matching your criteria.
              </div>
            )}
            
            {!isLoading && members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isSelected={selectedMembers.includes(member.id)}
                onSelect={() => toggleMemberSelection(member.id)}
                onAction={handleMemberAction}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPagination.page - 1) * currentPagination.limit) + 1} to{' '}
              {Math.min(currentPagination.page * currentPagination.limit, currentPagination.totalCount)} of{' '}
              {currentPagination.totalCount} members
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPagination.page - 1)}
                disabled={currentPagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm">
                Page {currentPagination.page} of {currentPagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPagination.page + 1)}
                disabled={currentPagination.page >= currentPagination.totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedMembers.length} selected member(s)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={isLoading}>
              {isLoading ? 'Processing...' : `${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface MemberCardProps {
  member: Member
  isSelected: boolean
  onSelect: () => void
  onAction: (memberId: string, action: 'activate' | 'deactivate' | 'delete' | 'view') => void
  isLoading: boolean
}

function MemberCard({ member, isSelected, onSelect, onAction, isLoading }: MemberCardProps) {
  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">
                {member.firstName} {member.lastName}
              </h3>
              <Badge variant={member.isActive ? "default" : "secondary"}>
                {member.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">
                {member.membershipType.toLowerCase()}
              </Badge>
              {member._count.familyMembers > 0 && (
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {member._count.familyMembers} family
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {member.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {member.mobileNumber}
              </div>
              {member.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {member.address.city}, {member.address.state}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction(member.id, member.isActive ? 'deactivate' : 'activate')}
            disabled={isLoading}
          >
            {member.isActive ? (
              <>
                <UserX className="h-3 w-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction(member.id, 'view')}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onAction(member.id, 'delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}