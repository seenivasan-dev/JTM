'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Edit, 
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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate')

  // Update URL with new filters
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
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
  }, [router, searchParams])

  // Get selected members info for smart bulk actions
  const selectedMembersInfo = members.filter(member => selectedMembers.includes(member.id))
  const selectedActiveCount = selectedMembersInfo.filter(member => member.isActive).length
  const selectedInactiveCount = selectedMembersInfo.filter(member => !member.isActive).length

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
  const handleMemberAction = async (memberId: string, action: 'activate' | 'deactivate') => {
    setIsLoading(true)
    try {
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

  // Pagination handlers
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/members?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
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
                  defaultValue={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                />
              </div>
            </div>
            
            <Select 
              defaultValue={filters.status} 
              onValueChange={(value) => updateFilters({ status: value })}
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
              defaultValue={filters.membershipType} 
              onValueChange={(value) => updateFilters({ membershipType: value })}
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
            {members.map((member) => (
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} members
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
  onAction: (memberId: string, action: 'activate' | 'deactivate') => void
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
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
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