'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  Key,
  Bell,
  Edit,
  Plus,
  Save,
  Calendar,
  Shield,
  Home,
  Eye,
  EyeOff,
  Smartphone,
  RefreshCcw,
  Megaphone,
  AlertCircle,
  Lock,
} from 'lucide-react'

const inputCls = 'h-11 border-gray-200 bg-white focus-visible:ring-cyan-500 focus-visible:border-cyan-500 rounded-xl'
const saveBtnCls = 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white rounded-xl h-11'

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
})

const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
})

const familyMemberSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  age: z.number().min(0).max(150, 'Invalid age'),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().min(2, 'Relationship is required'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  membershipType: string
  isActive: boolean
  membershipExpiry?: string
  mustChangePassword: boolean
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  familyMembers: Array<{
    id: string
    firstName: string
    lastName: string
    age: number
    contactNumber?: string
    email?: string
    relationship: string
  }>
  notifications?: {
    email: boolean
    push: boolean
    eventReminders: boolean
    membershipRenewal: boolean
    adminUpdates: boolean
  }
}

interface MemberProfileProps {
  user: User
}

// Shared section header with gradient icon badge
function SectionHeader({
  icon,
  title,
  subtitle,
  color = 'from-cyan-500 to-blue-600',
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-md shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function MemberProfile({ user }: MemberProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showFamilyDialog, setShowFamilyDialog] = useState(false)
  const [editingFamilyMember, setEditingFamilyMember] = useState<any>(null)

  return (
    <div className="space-y-8">
      {/* Tamil Cultural Profile Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center flex-wrap gap-3 mt-3">
                <span className="flex items-center gap-2 text-white drop-shadow-md bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <Badge className={`${user.isActive ? 'bg-emerald-500/20 border-emerald-300/30' : 'bg-gray-500/20 border-gray-300/30'} backdrop-blur-sm text-white drop-shadow-md border px-3 py-1.5`}>
                  {user.isActive ? '✓ Active Member' : 'Inactive'}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white drop-shadow-md border-white/30 px-3 py-1.5 capitalize">
                  {user.membershipType} Membership
                </Badge>
                {user.membershipExpiry && (
                  <Badge className="bg-gold/20 backdrop-blur-sm text-white drop-shadow-md border-gold/30 px-3 py-1.5">
                    <Calendar className="h-3 w-3 mr-1" />
                    Valid until {new Date(user.membershipExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white drop-shadow-md border-white/30"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-primary/5 to-secondary/5 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">
            <User className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-md">
            <Users className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden md:inline">Family ({user.familyMembers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-md">
            <Key className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-gold data-[state=active]:shadow-md">
            <Bell className="h-4 w-4 md:mr-2 shrink-0" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonalInfoCard user={user} isEditing={isEditing} />
            <AddressCard user={user} isEditing={isEditing} />
          </div>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family">
          <FamilyMembersCard
            familyMembers={user.familyMembers}
            onAddMember={() => {
              setEditingFamilyMember(null)
              setShowFamilyDialog(true)
            }}
            onEditMember={(member: any) => {
              setEditingFamilyMember(member)
              setShowFamilyDialog(true)
            }}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityCard
            user={user}
            onChangePassword={() => setShowPasswordDialog(true)}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsCard user={user} />
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        userId={user.id}
      />

      {/* Family Member Dialog */}
      <FamilyMemberDialog
        open={showFamilyDialog}
        onOpenChange={setShowFamilyDialog}
        member={editingFamilyMember}
        userId={user.id}
      />
    </div>
  )
}

function PersonalInfoCard({ user, isEditing }: { user: User, isEditing: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
    },
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
        window.location.reload()
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 pb-3 pt-4 px-5">
        <SectionHeader
          icon={<User className="h-5 w-5 text-white" />}
          title="Personal Information"
          subtitle="Your name and contact details"
          color="from-cyan-500 to-blue-600"
        />
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">
        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">First Name</Label>
                <Input className={inputCls} {...form.register('firstName')} />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-xs">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input className={inputCls} {...form.register('lastName')} />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" /> Mobile Number
              </Label>
              <Input className={inputCls} {...form.register('mobileNumber')} placeholder="+1 (904) 555-0100" />
              {form.formState.errors.mobileNumber && (
                <p className="text-red-500 text-xs">{form.formState.errors.mobileNumber.message}</p>
              )}
            </div>

            {message && (
              <Alert className="rounded-xl">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className={saveBtnCls} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="h-4 w-4 text-cyan-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="h-4 w-4 text-cyan-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="h-4 w-4 text-cyan-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{user.mobileNumber}</p>
              </div>
            </div>
            {user.membershipExpiry && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="h-4 w-4 text-cyan-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Membership Expiry</p>
                  <p className="font-medium text-gray-900">{new Date(user.membershipExpiry).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddressCard({ user, isEditing }: { user: User, isEditing: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: user.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: data }),
      })

      if (response.ok) {
        setMessage('Address updated successfully!')
        window.location.reload()
      } else {
        setMessage('Failed to update address')
      }
    } catch (error) {
      setMessage('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 pb-3 pt-4 px-5">
        <SectionHeader
          icon={<Home className="h-5 w-5 text-white" />}
          title="Home Address"
          subtitle="Your Jacksonville area address"
          color="from-violet-500 to-indigo-600"
        />
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">
        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" /> Street Address
              </Label>
              <Input className={inputCls} placeholder="123 Baymeadows Rd" {...form.register('street')} />
              {form.formState.errors.street && (
                <p className="text-red-500 text-xs">{form.formState.errors.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">City</Label>
                <Input className={inputCls} placeholder="Jacksonville" {...form.register('city')} />
                {form.formState.errors.city && (
                  <p className="text-red-500 text-xs">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">State</Label>
                <Input className={inputCls} placeholder="FL" {...form.register('state')} />
                {form.formState.errors.state && (
                  <p className="text-red-500 text-xs">{form.formState.errors.state.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">ZIP</Label>
                <Input className={inputCls} placeholder="32258" {...form.register('zipCode')} />
                {form.formState.errors.zipCode && (
                  <p className="text-red-500 text-xs">{form.formState.errors.zipCode.message}</p>
                )}
              </div>
            </div>

            {message && (
              <Alert className="rounded-xl">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className={saveBtnCls} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
          </form>
        ) : (
          <div>
            {user.address ? (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium text-gray-900">{user.address.street}</p>
                  <p className="text-gray-600">{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                  <p className="text-gray-500 text-sm">{user.address.country}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                No address on file. Click &ldquo;Edit Profile&rdquo; to add your address.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FamilyMembersCard({ familyMembers, onAddMember, onEditMember }: any) {
  return (
    <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<Users className="h-5 w-5 text-white" />}
            title="Family Members"
            subtitle={`${familyMembers.length} member${familyMembers.length !== 1 ? 's' : ''} in your plan`}
            color="from-orange-500 to-amber-600"
          />
          <Button
            onClick={onAddMember}
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 shadow-sm shrink-0 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">
        {familyMembers.length > 0 ? (
          <div className="space-y-3">
            {familyMembers.map((member: any) => {
              const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border-2 border-orange-100 rounded-xl bg-orange-50/40">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h4>
                      <p className="text-sm text-gray-500">
                        {member.relationship} · Age {member.age}
                      </p>
                      {member.email && (
                        <p className="text-xs text-gray-400">{member.email}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onEditMember(member)} className="rounded-xl border-orange-200 hover:bg-orange-50">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            No family members added yet. Click &ldquo;Add&rdquo; to include family members.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SecurityCard({ user, onChangePassword }: any) {
  return (
    <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 pb-3 pt-4 px-5">
        <SectionHeader
          icon={<Shield className="h-5 w-5 text-white" />}
          title="Account Security"
          subtitle="Manage your login credentials"
          color="from-rose-500 to-red-600"
        />
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 space-y-4">
        {user.mustChangePassword && (
          <Alert className="border-orange-200 bg-orange-50 rounded-xl">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800 font-semibold text-sm">Password Change Required</AlertTitle>
            <AlertDescription className="text-orange-700 text-sm">
              You must update your password before accessing all features.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-sm">
              <Lock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Password</p>
              <p className="text-sm text-gray-500">
                {user.mustChangePassword ? 'Password change pending' : 'Last updated recently'}
              </p>
            </div>
          </div>
          <Button
            onClick={onChangePassword}
            className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white rounded-xl shadow-sm"
            size="sm"
          >
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!pw) return { level: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-emerald-600']
  return { level: s as 0 | 1 | 2 | 3 | 4, label: labels[s], color: colors[s] }
}

const segmentColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']

function PasswordChangeDialog({ open, onOpenChange, userId }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue = form.watch('newPassword')
  const strength = getPasswordStrength(newPasswordValue)

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Password changed successfully!')
        form.reset()
        setTimeout(() => onOpenChange(false), 2000)
      } else {
        setMessage(result.error || 'Failed to change password')
      }
    } catch (error) {
      setMessage('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Enter your current password and choose a new one.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gray-400" /> Current Password
            </Label>
            <div className="relative">
              <Input
                className={`${inputCls} pr-10`}
                type={showCurrent ? 'text' : 'password'}
                {...form.register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.currentPassword && (
              <p className="text-red-500 text-xs">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gray-400" /> New Password
            </Label>
            <div className="relative">
              <Input
                className={`${inputCls} pr-10`}
                type={showNew ? 'text' : 'password'}
                {...form.register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-red-500 text-xs">{form.formState.errors.newPassword.message}</p>
            )}
            {/* Strength Bar */}
            {newPasswordValue && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        strength.level >= seg ? segmentColors[seg - 1] : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className={`text-xs font-medium ${strength.color}`}>
                    {strength.label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gray-400" /> Confirm New Password
            </Label>
            <div className="relative">
              <Input
                className={`${inputCls} pr-10`}
                type={showConfirm ? 'text' : 'password'}
                {...form.register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {message && (
            <Alert className={`rounded-xl ${message.includes('success') ? 'border-emerald-200 bg-emerald-50' : ''}`}>
              <AlertDescription className={message.includes('success') ? 'text-emerald-700' : ''}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className={saveBtnCls} disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NotificationsCard({ user }: { user: User }) {
  const [notifications, setNotifications] = useState(user.notifications || {
    email: true,
    push: true,
    eventReminders: true,
    membershipRenewal: true,
    adminUpdates: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateNotifications = async (key: string, value: boolean) => {
    setIsLoading(true)
    const updated = { ...notifications, [key]: value }
    setNotifications(updated)

    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: updated }),
      })
    } catch (error) {
      console.error('Failed to update notifications:', error)
      setNotifications(notifications)
    } finally {
      setIsLoading(false)
    }
  }

  const notificationConfig: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    email: {
      title: 'Email Notifications',
      desc: 'Receive updates and confirmations via email',
      icon: <Mail className="h-4 w-4 text-amber-600" />,
    },
    push: {
      title: 'Push Notifications',
      desc: 'Browser and device notifications',
      icon: <Smartphone className="h-4 w-4 text-amber-600" />,
    },
    eventReminders: {
      title: 'Event Reminders',
      desc: 'Reminders before events you RSVPd for',
      icon: <Calendar className="h-4 w-4 text-amber-600" />,
    },
    membershipRenewal: {
      title: 'Membership Renewal',
      desc: 'Alerts when your membership is nearing expiry',
      icon: <RefreshCcw className="h-4 w-4 text-amber-600" />,
    },
    adminUpdates: {
      title: 'Admin Updates',
      desc: 'Important messages from JTM administrators',
      icon: <Megaphone className="h-4 w-4 text-amber-600" />,
    },
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-3 pt-4 px-5">
        <SectionHeader
          icon={<Bell className="h-5 w-5 text-white" />}
          title="Notification Preferences"
          subtitle="Choose what you want to hear about"
          color="from-amber-500 to-orange-600"
        />
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 space-y-2">
        {Object.entries(notifications).map(([key, enabled]) => {
          const config = notificationConfig[key] || {
            title: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()),
            desc: '',
            icon: <Bell className="h-4 w-4 text-amber-600" />,
          }
          return (
            <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  {config.icon}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{config.title}</p>
                  {config.desc && <p className="text-xs text-gray-500">{config.desc}</p>}
                </div>
              </div>
              <Checkbox
                checked={enabled}
                onCheckedChange={(checked) => updateNotifications(key, checked as boolean)}
                disabled={isLoading}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function FamilyMemberDialog({ open, onOpenChange, member, userId }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const isEditing = !!member

  const form = useForm({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: member || {
      firstName: '',
      lastName: '',
      age: 0,
      contactNumber: '',
      email: '',
      relationship: '',
    },
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setMessage('')

    try {
      const url = isEditing
        ? `/api/users/${userId}/family/${member.id}`
        : `/api/users/${userId}/family`

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMessage(`Family member ${isEditing ? 'updated' : 'added'} successfully!`)
        form.reset()
        setTimeout(() => {
          onOpenChange(false)
          window.location.reload()
        }, 2000)
      } else {
        setMessage('Failed to save family member')
      }
    } catch (error) {
      setMessage('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <DialogTitle>{isEditing ? 'Edit' : 'Add'} Family Member</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">First Name</Label>
              <Input className={inputCls} {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-xs">{String(form.formState.errors.firstName.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Last Name</Label>
              <Input className={inputCls} {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-xs">{String(form.formState.errors.lastName.message)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Age</Label>
              <Input
                className={inputCls}
                type="number"
                {...form.register('age', { valueAsNumber: true })}
              />
              {form.formState.errors.age && (
                <p className="text-red-500 text-xs">{String(form.formState.errors.age.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Relationship</Label>
              <Input className={inputCls} placeholder="Spouse / Child" {...form.register('relationship')} />
              {form.formState.errors.relationship && (
                <p className="text-red-500 text-xs">{String(form.formState.errors.relationship.message)}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-400" /> Contact Number (Optional)
            </Label>
            <Input className={inputCls} placeholder="+1 (904)..." {...form.register('contactNumber')} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" /> Email (Optional)
            </Label>
            <Input className={inputCls} type="email" placeholder="email@example.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs">{String(form.formState.errors.email.message)}</p>
            )}
          </div>

          {message && (
            <Alert className="rounded-xl">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className={saveBtnCls} disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add')} Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
