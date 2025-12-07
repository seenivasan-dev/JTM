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
import { Trash2, Plus, CreditCard, Users, Calendar, Sparkles, RefreshCcw } from 'lucide-react'

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 via-blue-50 to-orange-50 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg">
              <RefreshCcw className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Renewal Request Submitted! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">Your request is being processed by our team</p>
            </div>
          </div>

          <Card className="elevated-card border-t-4 border-t-emerald-500 backdrop-blur-sm bg-white/90">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200">
                <div>
                  <h4 className="font-semibold text-lg mb-1">Current Status</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Submitted on {new Date(pendingRenewal.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <Badge 
                  variant={pendingRenewal.status === 'PENDING' ? 'secondary' : pendingRenewal.status === 'APPROVED' ? 'default' : 'destructive'}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  {pendingRenewal.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Requested Membership</p>
                  <p className="font-semibold text-lg text-primary">{pendingRenewal.newType}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5 border border-secondary/20">
                  <p className="text-sm text-muted-foreground mb-1">Payment Reference</p>
                  <p className="font-semibold text-lg text-secondary">{pendingRenewal.paymentReference}</p>
                </div>
              </div>

              {pendingRenewal.status === 'PENDING' && (
                <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>Under Review</strong> - Your renewal request is being carefully reviewed by our admin team. 
                    You&apos;ll receive an email notification once it&apos;s processed. Thank you for your patience! 🙏
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tamil Cultural Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
            <RefreshCcw className="h-8 w-8 text-white drop-shadow-md" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              புதுப்பிக்கவும் (Renew Membership) ✨
            </h1>
            <p className="text-white drop-shadow-md text-lg">
              Continue your journey with the Jaffna Tamil Mahamandram community
            </p>
          </div>
        </div>
      </div>

      {/* Expiration Alert for Inactive Users */}
      {!user.isActive && (
        <Alert variant="destructive" className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50">
          <Calendar className="h-5 w-5" />
          <AlertDescription className="flex items-center gap-2">
            <div>
              <strong className="text-lg">Your membership has expired!</strong>
              <p className="mt-2">
                Please submit a renewal request below to reactivate your membership and regain access to all community features.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Membership Info */}
      <Card className="elevated-card border-t-4 border-t-primary shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            Current Membership Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Membership Type
              </p>
              <p className="font-bold text-xl text-primary">{user.membershipType}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <Badge 
                variant={user.isActive ? "default" : "destructive"}
                className="px-3 py-1 text-sm font-semibold"
              >
                {user.isActive ? "✓ Active" : "⚠ Expired"}
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Family Members
              </p>
              <p className="font-bold text-xl text-accent">{user.familyMembers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal Form */}
      <Card className="elevated-card border-t-4 border-t-secondary shadow-xl">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-accent shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Renew Membership</CardTitle>
              <CardDescription className="text-base mt-1">
                Submit your membership renewal request for {currentYear}. All memberships expire on December 31st at 11:59 PM.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6 border-2 border-red-300">
              <AlertDescription className="font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-900 font-semibold">{success}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Membership Type Selection */}
              <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-orange-50/50 to-blue-50/50 border-2 border-orange-200">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Membership Details
                </h3>
                <FormField
                  control={form.control}
                  name="newMembershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Membership Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 hover:border-primary transition-colors">
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL" className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Individual</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="FAMILY" className="py-3">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className="font-semibold">Family</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CUSTOM" className="py-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              <span className="font-semibold">Custom</span>
                            </div>
                          </SelectItem>
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
                      <FormLabel className="text-base font-semibold">Payment Reference Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter payment confirmation number"
                          className="h-12 border-2 hover:border-secondary transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
                        💳 Please provide the payment confirmation number after completing your payment.
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Family Members Section */}
              {membershipType === 'FAMILY' && (
                <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-accent">
                      <Users className="h-5 w-5" />
                      Family Members
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addFamilyMember}
                      className="bg-gradient-to-r from-accent to-emerald-600 text-white hover:from-accent/90 hover:to-emerald-600/90 border-0 shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>

                  {fields.length > 0 && (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="border-2 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-emerald-50 to-teal-50">
                            <CardTitle className="text-base font-bold text-accent flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              Family Member {index + 1}
                            </CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`familyMembers.${index}.firstName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-semibold">First Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John" className="border-2 hover:border-accent transition-colors" {...field} />
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
                                    <FormLabel className="font-semibold">Last Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Doe" className="border-2 hover:border-accent transition-colors" {...field} />
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
                                    <FormLabel className="font-semibold">Age</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="25" 
                                        className="border-2 hover:border-accent transition-colors"
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
                                    <FormLabel className="font-semibold">Relationship</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Spouse, Child, etc." className="border-2 hover:border-accent transition-colors" {...field} />
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
                                    <FormLabel className="font-semibold">Contact Number (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+1 (555) 123-4567" className="border-2 hover:border-accent transition-colors" {...field} />
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
                                    <FormLabel className="font-semibold">Email (Optional)</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="jane.doe@example.com" className="border-2 hover:border-accent transition-colors" {...field} />
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
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 hover:from-orange-700 hover:via-blue-700 hover:to-emerald-700 text-white hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCcw className="h-5 w-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Submit Renewal Request
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}