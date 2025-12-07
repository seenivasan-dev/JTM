/* eslint-disable @typescript-eslint/no-explicit-any */
// JTM Web - Member Renewal Request Component
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, CreditCard, Users, Calendar } from 'lucide-react'

// Validation schema
const familyMemberSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  age: z.number().min(0).max(150, 'Invalid age'),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().min(2, 'Relationship is required'),
})

const renewalSchema = z.object({
  newMembershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']),
  paymentReference: z.string().min(5, 'Payment reference is required'),
  familyMembers: z.array(familyMemberSchema).optional(),
})

type RenewalFormData = z.infer<typeof renewalSchema>

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  membershipType: string
  isActive: boolean
  membershipExpiry?: string
  familyMembers: Array<{
    id: string
    firstName: string
    lastName: string
    age: number
    relationship: string
  }>
}

interface PendingRenewal {
  id: string
  newType: string
  paymentReference: string
  status: string
  createdAt: string
}

interface MemberRenewalRequestProps {
  user: User
  pendingRenewal?: PendingRenewal
}

export default function MemberRenewalRequest({ user, pendingRenewal }: MemberRenewalRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const form = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      newMembershipType: user.membershipType as any,
      paymentReference: '',
      familyMembers: user.familyMembers.map(member => ({
        firstName: member.firstName,
        lastName: member.lastName,
        age: member.age,
        contactNumber: '',
        email: '',
        relationship: member.relationship,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'familyMembers',
  })

  const membershipType = form.watch('newMembershipType')

  // Calculate expiry date (Dec 31st of current year)
  const currentYear = new Date().getFullYear()
  const expiryDate = new Date(currentYear, 11, 31, 23, 59, 59) // Dec 31st 11:59 PM

  const onSubmit = async (data: RenewalFormData) => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/users/renewals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit renewal request')
      }

      setSuccess('Renewal request submitted successfully! You will be notified once it\'s reviewed.')
      
      // Refresh page after 3 seconds
      setTimeout(() => {
        router.refresh()
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit renewal request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addFamilyMember = () => {
    append({
      firstName: '',
      lastName: '',
      age: 0,
      contactNumber: '',
      email: '',
      relationship: '',
    })
  }

  // If user has pending renewal, show status
  if (pendingRenewal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Membership Renewal Status
          </CardTitle>
          <CardDescription>
            Your renewal request is currently being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Current Status</h4>
              <p className="text-sm text-muted-foreground">
                Submitted on {new Date(pendingRenewal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={pendingRenewal.status === 'PENDING' ? 'secondary' : pendingRenewal.status === 'APPROVED' ? 'default' : 'destructive'}>
              {pendingRenewal.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p><strong>Requested Membership:</strong> {pendingRenewal.newType}</p>
            <p><strong>Payment Reference:</strong> {pendingRenewal.paymentReference}</p>
          </div>

          {pendingRenewal.status === 'PENDING' && (
            <Alert>
              <AlertDescription>
                Your renewal request is being reviewed by our admin team. You will receive an email notification once it&apos;s processed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Expiration Alert for Inactive Users */}
      {!user.isActive && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <div>
              <strong>Your membership has expired!</strong>
              <p className="mt-1">
                Please submit a renewal request below to reactivate your membership and regain access to all community features.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Membership Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Membership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Membership Type</p>
              <p className="font-medium">{user.membershipType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={user.isActive ? "default" : "destructive"}>
                {user.isActive ? "Active" : "Expired"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Family Members</p>
              <p className="font-medium">{user.familyMembers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Renew Membership
          </CardTitle>
          <CardDescription>
            Submit your membership renewal request for {currentYear}. All memberships expire on December 31st at 11:59 PM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Membership Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Membership Details</h3>
                <FormField
                  control={form.control}
                  name="newMembershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                          <SelectItem value="FAMILY">Family</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reference Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter payment confirmation number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Please provide the payment confirmation number after completing your payment.
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Family Members Section */}
              {membershipType === 'FAMILY' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Family Members</h3>
                    <Button type="button" variant="outline" onClick={addFamilyMember}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>

                  {fields.length > 0 && (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Family Member {index + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.firstName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.lastName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.age`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="25" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.relationship`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Relationship</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Spouse, Child, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.contactNumber`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact Number (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+1 (555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.email`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="jane.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Renewal Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}