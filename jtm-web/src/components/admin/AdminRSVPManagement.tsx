'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Check, 
  X, 
  Search, 
  Filter,
  Download,
  QrCode,
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Users,
  DollarSign,
  Eye,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  membershipType?: string
}

interface RSVPResponse {
  id: string
  responses: Record<string, any>
  paymentReference?: string | null
  paymentConfirmed: boolean
  qrCode?: string | null
  checkedIn: boolean
  checkedInAt?: string | null
  createdAt: string
  updatedAt: string
  user: User
}

interface Event {
  id: string
  title: string
  date: string
  location: string
  rsvpForm?: {
    fields: Array<{
      id: string
      type: string
      label: string
      required: boolean
      options?: string[]
    }>
  }
}

interface AdminRSVPManagementProps {
  event: Event
  initialRSVPs: RSVPResponse[]
}

export default function AdminRSVPManagement({ event, initialRSVPs }: AdminRSVPManagementProps) {
  const [rsvps, setRSVPs] = useState(initialRSVPs)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'checkedIn'>('all')
  const [foodFilter, setFoodFilter] = useState<'all' | 'veg' | 'nonveg' | 'none'>('all')
  const [selectedRSVP, setSelectedRSVP] = useState<RSVPResponse | null>(null)
  const [bulkSelection, setBulkSelection] = useState<string[]>([])

  // Filter RSVPs based on search and filters
  const filteredRSVPs = rsvps.filter(rsvp => {
    const matchesSearch = 
      rsvp.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rsvp.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rsvp.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rsvp.paymentReference && rsvp.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !rsvp.paymentConfirmed) ||
      (statusFilter === 'approved' && rsvp.paymentConfirmed) ||
      (statusFilter === 'checkedIn' && rsvp.checkedIn)

    const foodPreference = rsvp.responses?.foodPreference || rsvp.responses?.food || 'none'
    const matchesFood = 
      foodFilter === 'all' ||
      (foodFilter === 'veg' && foodPreference === 'veg') ||
      (foodFilter === 'nonveg' && foodPreference === 'nonveg') ||
      (foodFilter === 'none' && !foodPreference || foodPreference === 'no')

    return matchesSearch && matchesStatus && matchesFood
  })

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    pending: rsvps.filter(r => !r.paymentConfirmed).length,
    approved: rsvps.filter(r => r.paymentConfirmed).length,
    checkedIn: rsvps.filter(r => r.checkedIn).length,
    vegMeals: rsvps.filter(r => {
      const food = r.responses?.foodPreference || r.responses?.food
      return food === 'veg' || food === 'vegetarian'
    }).length,
    nonVegMeals: rsvps.filter(r => {
      const food = r.responses?.foodPreference || r.responses?.food
      return food === 'nonveg' || food === 'non-vegetarian'
    }).length,
    totalMeals: rsvps.filter(r => {
      const food = r.responses?.foodPreference || r.responses?.food || r.responses?.foodRequired
      return food && food !== 'no' && food !== 'none'
    }).length
  }

  const handleRSVPAction = async (rsvpId: string, action: 'approve_payment' | 'reject_payment' | 'checkin') => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsvpId,
          action,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update the RSVP in the list
        setRSVPs(prev => prev.map(rsvp => 
          rsvp.id === rsvpId 
            ? { ...rsvp, ...result.rsvp }
            : rsvp
        ))

        // Close dialog if open
        setSelectedRSVP(null)
      } else {
        console.error('Failed to update RSVP')
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: 'approve_payment' | 'reject_payment') => {
    if (bulkSelection.length === 0) return

    setLoading(true)
    try {
      // Process all selected RSVPs
      const promises = bulkSelection.map(rsvpId => 
        fetch('/api/admin/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rsvpId,
            action,
          }),
        })
      )

      await Promise.all(promises)
      
      // Refresh the data
      const updatedRSVPs = await fetch(`/api/admin/rsvp?eventId=${event.id}`)
      const data = await updatedRSVPs.json()
      setRSVPs(data.rsvps)
      setBulkSelection([])
    } catch (error) {
      console.error('Error with bulk action:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportRSVPData = () => {
    const csvData = [
      [
        'Name', 'Email', 'Membership Type', 'Payment Reference', 'Payment Status', 
        'Food Preference', 'Special Requirements', 'Family Members', 'Check-in Status', 
        'Check-in Date', 'RSVP Date'
      ],
      ...filteredRSVPs.map(rsvp => [
        `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        rsvp.user.email,
        rsvp.user.membershipType || 'N/A',
        rsvp.paymentReference || 'N/A',
        rsvp.paymentConfirmed ? 'Confirmed' : 'Pending',
        rsvp.responses?.foodPreference || rsvp.responses?.food || 'None',
        rsvp.responses?.specialRequirements || rsvp.responses?.dietary || 'None',
        rsvp.responses?.familyMembers || rsvp.responses?.attendees || '1',
        rsvp.checkedIn ? 'Checked In' : 'Not Checked In',
        rsvp.checkedInAt ? format(new Date(rsvp.checkedInAt), 'MMM dd, yyyy HH:mm') : 'N/A',
        format(new Date(rsvp.createdAt), 'MMM dd, yyyy HH:mm')
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_rsvp_responses.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getFoodPreferenceDisplay = (responses: Record<string, any>) => {
    const food = responses?.foodPreference || responses?.food || responses?.foodRequired
    if (!food || food === 'no' || food === 'none') return 'No Food'
    if (food === 'veg' || food === 'vegetarian') return 'Vegetarian'
    if (food === 'nonveg' || food === 'non-vegetarian') return 'Non-Vegetarian'
    return food
  }

  const renderRSVPResponses = (responses: Record<string, any>) => {
    if (!responses || Object.keys(responses).length === 0) return null

    return (
      <div className="space-y-2">
        {Object.entries(responses).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RSVP Management</h2>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportRSVPData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-lg font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-lg font-bold">{stats.checkedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Meals</p>
                <p className="text-lg font-bold">{stats.totalMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">Veg Meals</p>
                <p className="text-lg font-bold">{stats.vegMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-500 rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">Non-Veg</p>
                <p className="text-lg font-bold">{stats.nonVegMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or payment reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending Payment</SelectItem>
            <SelectItem value="approved">Payment Approved</SelectItem>
            <SelectItem value="checkedIn">Checked In</SelectItem>
          </SelectContent>
        </Select>

        <Select value={foodFilter} onValueChange={(value: any) => setFoodFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Food Preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Food</SelectItem>
            <SelectItem value="veg">Vegetarian</SelectItem>
            <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
            <SelectItem value="none">No Food</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {bulkSelection.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span>{bulkSelection.length} RSVPs selected</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleBulkAction('approve_payment')}
                  disabled={loading}
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button 
                  onClick={() => handleBulkAction('reject_payment')}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
                <Button 
                  onClick={() => setBulkSelection([])}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSVP Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All RSVPs ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="food">Food Orders ({stats.totalMeals})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <RSVPList 
            rsvps={filteredRSVPs}
            bulkSelection={bulkSelection}
            setBulkSelection={setBulkSelection}
            onAction={handleRSVPAction}
            setSelectedRSVP={setSelectedRSVP}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <RSVPList 
            rsvps={filteredRSVPs.filter(r => !r.paymentConfirmed)}
            bulkSelection={bulkSelection}
            setBulkSelection={setBulkSelection}
            onAction={handleRSVPAction}
            setSelectedRSVP={setSelectedRSVP}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <RSVPList 
            rsvps={filteredRSVPs.filter(r => r.paymentConfirmed)}
            bulkSelection={bulkSelection}
            setBulkSelection={setBulkSelection}
            onAction={handleRSVPAction}
            setSelectedRSVP={setSelectedRSVP}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="food" className="space-y-4">
          <FoodOrdersList 
            rsvps={filteredRSVPs.filter(r => {
              const food = r.responses?.foodPreference || r.responses?.food || r.responses?.foodRequired
              return food && food !== 'no' && food !== 'none'
            })}
            setSelectedRSVP={setSelectedRSVP}
          />
        </TabsContent>
      </Tabs>

      {/* RSVP Detail Dialog */}
      {selectedRSVP && (
        <RSVPDetailDialog
          rsvp={selectedRSVP}
          event={event}
          onClose={() => setSelectedRSVP(null)}
          onAction={handleRSVPAction}
          loading={loading}
        />
      )}
    </div>
  )
}

// RSVP List Component
function RSVPList({ 
  rsvps, 
  bulkSelection, 
  setBulkSelection, 
  onAction, 
  setSelectedRSVP, 
  loading 
}: {
  rsvps: RSVPResponse[]
  bulkSelection: string[]
  setBulkSelection: (selection: string[]) => void
  onAction: (rsvpId: string, action: 'approve_payment' | 'reject_payment' | 'checkin') => void
  setSelectedRSVP: (rsvp: RSVPResponse) => void
  loading: boolean
}) {
  const handleBulkSelect = (rsvpId: string, checked: boolean) => {
    if (checked) {
      setBulkSelection([...bulkSelection, rsvpId])
    } else {
      setBulkSelection(bulkSelection.filter(id => id !== rsvpId))
    }
  }

  const getFoodPreferenceDisplay = (responses: Record<string, any>) => {
    const food = responses?.foodPreference || responses?.food || responses?.foodRequired
    if (!food || food === 'no' || food === 'none') return 'No Food'
    if (food === 'veg' || food === 'vegetarian') return 'Vegetarian'
    if (food === 'nonveg' || food === 'non-vegetarian') return 'Non-Vegetarian'
    return food
  }

  return (
    <div className="space-y-4">
      {rsvps.map((rsvp) => (
        <Card key={rsvp.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <input
                  type="checkbox"
                  checked={bulkSelection.includes(rsvp.id)}
                  onChange={(e) => handleBulkSelect(rsvp.id, e.target.checked)}
                  className="mt-1"
                />
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* User Info */}
                  <div>
                    <h3 className="font-semibold">{rsvp.user.firstName} {rsvp.user.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{rsvp.user.email}</p>
                    <p className="text-sm text-muted-foreground">{rsvp.user.membershipType || 'Regular'}</p>
                  </div>

                  {/* RSVP Details */}
                  <div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Food:</span>
                        <span>{getFoodPreferenceDisplay(rsvp.responses)}</span>
                      </div>
                      {rsvp.paymentReference && (
                        <div className="flex justify-between text-sm">
                          <span>Payment Ref:</span>
                          <span className="font-mono">{rsvp.paymentReference}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>RSVP Date:</span>
                        <span>{format(new Date(rsvp.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Badge variant={rsvp.paymentConfirmed ? "default" : "secondary"}>
                        {rsvp.paymentConfirmed ? "Payment Approved" : "Payment Pending"}
                      </Badge>
                      {rsvp.checkedIn && (
                        <Badge variant="outline" className="bg-green-50">
                          Checked In
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedRSVP(rsvp)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {!rsvp.paymentConfirmed && (
                        <>
                          <Button
                            onClick={() => onAction(rsvp.id, 'approve_payment')}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => onAction(rsvp.id, 'reject_payment')}
                            disabled={loading}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {rsvp.paymentConfirmed && !rsvp.checkedIn && (
                        <Button
                          onClick={() => onAction(rsvp.id, 'checkin')}
                          disabled={loading}
                          size="sm"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {rsvps.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No RSVPs Found</h3>
            <p className="text-muted-foreground">No RSVP responses match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Food Orders List Component
function FoodOrdersList({ 
  rsvps, 
  setSelectedRSVP 
}: {
  rsvps: RSVPResponse[]
  setSelectedRSVP: (rsvp: RSVPResponse) => void
}) {
  const getFoodPreferenceDisplay = (responses: Record<string, any>) => {
    const food = responses?.foodPreference || responses?.food || responses?.foodRequired
    if (food === 'veg' || food === 'vegetarian') return 'Vegetarian'
    if (food === 'nonveg' || food === 'non-vegetarian') return 'Non-Vegetarian'
    return food
  }

  const getFoodIcon = (responses: Record<string, any>) => {
    const food = responses?.foodPreference || responses?.food || responses?.foodRequired
    if (food === 'veg' || food === 'vegetarian') return '🌱'
    if (food === 'nonveg' || food === 'non-vegetarian') return '🍖'
    return '🍽️'
  }

  return (
    <div className="space-y-4">
      {rsvps.map((rsvp) => (
        <Card key={rsvp.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getFoodIcon(rsvp.responses)}</div>
                <div>
                  <h3 className="font-semibold">{rsvp.user.firstName} {rsvp.user.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{rsvp.user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{getFoodPreferenceDisplay(rsvp.responses)}</p>
                  <div className="flex gap-2">
                    <Badge variant={rsvp.paymentConfirmed ? "default" : "secondary"}>
                      {rsvp.paymentConfirmed ? "Paid" : "Pending"}
                    </Badge>
                    {rsvp.checkedIn && (
                      <Badge variant="outline" className="bg-green-50">
                        Checked In
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => setSelectedRSVP(rsvp)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            </div>
            
            {(rsvp.responses?.specialRequirements || rsvp.responses?.dietary) && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Special Requirements:</p>
                <p className="text-sm text-muted-foreground">
                  {rsvp.responses?.specialRequirements || rsvp.responses?.dietary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// RSVP Detail Dialog Component
function RSVPDetailDialog({ 
  rsvp, 
  event,
  onClose, 
  onAction, 
  loading 
}: {
  rsvp: RSVPResponse
  event: Event
  onClose: () => void
  onAction: (rsvpId: string, action: 'approve_payment' | 'reject_payment' | 'checkin') => void
  loading: boolean
}) {
  const renderRSVPResponses = (responses: Record<string, any>) => {
    if (!responses || Object.keys(responses).length === 0) return null

    return (
      <div className="space-y-3">
        {Object.entries(responses).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span className="text-right max-w-48">
              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RSVP Details</DialogTitle>
          <DialogDescription>
            {rsvp.user.firstName} {rsvp.user.lastName} - {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Attendee Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{rsvp.user.firstName} {rsvp.user.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{rsvp.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Membership Type</p>
                <p className="text-sm text-muted-foreground">{rsvp.user.membershipType || 'Regular'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">RSVP Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(rsvp.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Payment Reference</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {rsvp.paymentReference || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Payment Status</p>
                <Badge variant={rsvp.paymentConfirmed ? "default" : "secondary"}>
                  {rsvp.paymentConfirmed ? "Approved" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>

          {/* RSVP Responses */}
          <div>
            <h3 className="text-lg font-semibold mb-3">RSVP Responses</h3>
            {renderRSVPResponses(rsvp.responses)}
          </div>

          {/* Check-in Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Check-in Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Check-in Status</p>
                <Badge variant={rsvp.checkedIn ? "default" : "secondary"}>
                  {rsvp.checkedIn ? "Checked In" : "Not Checked In"}
                </Badge>
              </div>
              {rsvp.checkedInAt && (
                <div>
                  <p className="text-sm font-medium">Check-in Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(rsvp.checkedInAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          {rsvp.qrCode && (
            <div>
              <h3 className="text-lg font-semibold mb-3">QR Code</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono break-all">{rsvp.qrCode}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {!rsvp.paymentConfirmed && (
              <>
                <Button
                  onClick={() => onAction(rsvp.id, 'approve_payment')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Payment
                </Button>
                <Button
                  onClick={() => onAction(rsvp.id, 'reject_payment')}
                  disabled={loading}
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Payment
                </Button>
              </>
            )}
            
            {rsvp.paymentConfirmed && !rsvp.checkedIn && (
              <Button
                onClick={() => onAction(rsvp.id, 'checkin')}
                disabled={loading}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Check In
              </Button>
            )}
            
            <Button onClick={onClose} variant="outline" className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}