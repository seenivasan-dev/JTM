'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Trash2,
  Save,
  Calendar
} from 'lucide-react'

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

export default function MemberProfile({ user }: MemberProfileProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showFamilyDialog, setShowFamilyDialog] = useState(false)
  const [editingFamilyMember, setEditingFamilyMember] = useState<any>(null)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active Member" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {user.membershipType.toLowerCase()}
                </Badge>
              </CardDescription>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="family">
            <Users className="h-4 w-4 mr-2" />
            Family ({user.familyMembers.length})
          </TabsTrigger>
          <TabsTrigger value="security">
            <Key className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
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
        // Refresh the page to show updated data
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
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input {...form.register('mobileNumber')} />
              {form.formState.errors.mobileNumber && (
                <p className="text-red-500 text-sm">{form.formState.errors.mobileNumber.message}</p>
              )}
            </div>

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.mobileNumber}</span>
            </div>
            {user.membershipExpiry && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Expires: {new Date(user.membershipExpiry).toLocaleDateString()}</span>
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
    <Card>
      <CardHeader>
        <CardTitle>Address</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input {...form.register('street')} />
              {form.formState.errors.street && (
                <p className="text-red-500 text-sm">{form.formState.errors.street.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input {...form.register('city')} />
                {form.formState.errors.city && (
                  <p className="text-red-500 text-sm">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input {...form.register('state')} />
                {form.formState.errors.state && (
                  <p className="text-red-500 text-sm">{form.formState.errors.state.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input {...form.register('zipCode')} />
                {form.formState.errors.zipCode && (
                  <p className="text-red-500 text-sm">{form.formState.errors.zipCode.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input {...form.register('country')} />
                {form.formState.errors.country && (
                  <p className="text-red-500 text-sm">{form.formState.errors.country.message}</p>
                )}
              </div>
            </div>

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            {user.address ? (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{user.address.street}</div>
                  <div>{user.address.city}, {user.address.state} {user.address.zipCode}</div>
                  <div>{user.address.country}</div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No address provided</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FamilyMembersCard({ familyMembers, onAddMember, onEditMember }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Family Members</CardTitle>
          <Button onClick={onAddMember}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {familyMembers.length > 0 ? (
          <div className="space-y-4">
            {familyMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {member.relationship} • Age {member.age}
                  </p>
                  {member.email && (
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => onEditMember(member)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No family members added</p>
        )}
      </CardContent>
    </Card>
  )
}

function SecurityCard({ user, onChangePassword }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Password</h4>
            <p className="text-sm text-muted-foreground">
              Last updated: {user.mustChangePassword ? 'Never' : 'Recently'}
            </p>
          </div>
          <Button variant="outline" onClick={onChangePassword}>
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>

        {user.mustChangePassword && (
          <Alert>
            <AlertDescription>
              You must change your password before accessing other features.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
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
      // Revert on error
      setNotifications(notifications)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(notifications).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </h4>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => updateNotifications(key, e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PasswordChangeDialog({ open, onOpenChange, userId }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input type="password" {...form.register('currentPassword')} />
            {form.formState.errors.currentPassword && (
              <p className="text-red-500 text-sm">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input type="password" {...form.register('newPassword')} />
            {form.formState.errors.newPassword && (
              <p className="text-red-500 text-sm">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input type="password" {...form.register('confirmPassword')} />
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit' : 'Add'} Family Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm">{String(form.formState.errors.firstName.message)}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm">{String(form.formState.errors.lastName.message)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input 
                type="number" 
                {...form.register('age', { valueAsNumber: true })} 
              />
              {form.formState.errors.age && (
                <p className="text-red-500 text-sm">{String(form.formState.errors.age.message)}</p>
              )}
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input {...form.register('relationship')} />
              {form.formState.errors.relationship && (
                <p className="text-red-500 text-sm">{String(form.formState.errors.relationship.message)}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
            <Input {...form.register('contactNumber')} />
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{String(form.formState.errors.email.message)}</p>
            )}
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add')} Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}