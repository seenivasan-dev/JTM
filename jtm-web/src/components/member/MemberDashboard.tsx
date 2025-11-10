'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Calendar, 
  Bell, 
  Settings, 
  Users, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface MemberDashboardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    membershipType: string
    isActive: boolean
    membershipExpiry?: string
    mustChangePassword: boolean
    familyMembers: any[]
    address?: any
  }
  recentEvents: any[]
}

export default function MemberDashboard({ user, recentEvents }: MemberDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your membership
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={user.isActive ? "default" : "secondary"} className="text-sm">
              {user.isActive ? "Active Member" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {!user.isActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account is pending activation. Please contact an administrator.
          </AlertDescription>
        </Alert>
      )}

      {user.mustChangePassword && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must change your password before accessing other features.
            <Button asChild className="ml-2" size="sm">
              <Link href="/profile?tab=security">Change Password</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {user.membershipType.toLowerCase()} membership
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.familyMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              registered family members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              available to RSVP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.membershipExpiry ? (
                new Date(user.membershipExpiry) > new Date() ? "Valid" : "Expired"
              ) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.membershipExpiry 
                ? `Until ${new Date(user.membershipExpiry).toLocaleDateString()}`
                : "No expiry date set"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Manage Profile
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/events">
              <Calendar className="mr-2 h-4 w-4" />
              View Events
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/profile?tab=notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/profile?tab=security">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{user.familyMembers.length} family member(s)</span>
            </div>
            {user.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.address.city}, {user.address.state}</span>
              </div>
            )}
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/profile">Update Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Events</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/events">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/events/${event.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent events available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Important Notices */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user.membershipExpiry && new Date(user.membershipExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your membership expires on {new Date(user.membershipExpiry).toLocaleDateString()}. 
                  Please renew soon to avoid service interruption.
                  <Button asChild className="ml-2" size="sm">
                    <Link href="/renewals">Renew Now</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>• Keep your profile information up to date</p>
              <p>• Check for new events regularly</p>
              <p>• Update your notification preferences as needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}