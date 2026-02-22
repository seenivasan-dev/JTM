'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Heart,
  Star
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
  const membershipExpiryDate = user.membershipExpiry ? new Date(user.membershipExpiry) : null
  const daysUntilExpiry = membershipExpiryDate ? Math.ceil((membershipExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30

  return (
    <div className="space-y-8">
      {/* Tamil Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                வணக்கம், {user.firstName}! 👋
              </h1>
              <p className="text-white drop-shadow-md text-lg">
                Welcome to your JTM Community Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm px-4 py-2 drop-shadow-md">
                <Sparkles className="h-4 w-4 mr-1" />
                {user.membershipType} Member
              </Badge>
              {user.isActive && (
                <Badge className="bg-emerald-500/20 backdrop-blur-sm text-white border-emerald-300/30 text-sm px-4 py-2 drop-shadow-md">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {!user.isActive && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Your account is pending activation. Please contact an administrator to activate your membership.
          </AlertDescription>
        </Alert>
      )}

      {user.mustChangePassword && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800 flex items-center justify-between flex-wrap gap-3">
            <span>For security, please change your temporary password before accessing other features.</span>
            <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Link href="/profile?tab=security">Change Password Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isExpiringSoon && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800 flex items-center justify-between flex-wrap gap-3">
            <span>
              Your membership expires in <strong>{daysUntilExpiry} days</strong> on {membershipExpiryDate?.toLocaleDateString()}. 
              Renew now to continue enjoying all benefits!
            </span>
            <Button asChild size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
              <Link href="/renewal">Renew Membership</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats with Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="elevated-card border-t-4 border-t-primary hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.isActive ? (
                <span className="text-emerald-600">Active</span>
              ) : (
                <span className="text-gray-500">Inactive</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {user.membershipType} membership
            </p>
          </CardContent>
        </Card>

        <Card className="elevated-card border-t-4 border-t-secondary hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <div className="p-2 bg-gradient-to-br from-secondary to-secondary/70 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{user.familyMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              registered family members
            </p>
          </CardContent>
        </Card>

        <Card className="elevated-card border-t-4 border-t-accent hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <div className="p-2 bg-gradient-to-br from-accent to-accent/70 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{recentEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              events available
            </p>
          </CardContent>
        </Card>

        <Card className="elevated-card border-t-4 border-t-gold hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
            <div className="p-2 bg-gradient-to-br from-gold to-gold/70 rounded-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membershipExpiryDate ? (
                membershipExpiryDate > new Date() ? (
                  <span className="text-emerald-600">Valid</span>
                ) : (
                  <span className="text-red-600">Expired</span>
                )
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {membershipExpiryDate 
                ? membershipExpiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : "No expiry date set"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <Card className="elevated-card">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              Profile Summary
            </CardTitle>
            <CardDescription>Your membership information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Full Name</div>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Family Size</div>
                <div className="font-medium">{user.familyMembers.length + 1} member(s)</div>
              </div>
            </div>

            {user.address && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-gold/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-medium">{user.address.city}, {user.address.state}</div>
                </div>
              </div>
            )}

            <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white">
              <Link href="/profile">
                <TrendingUp className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="elevated-card">
          <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Recent Events
              </CardTitle>
              <Button asChild size="sm" variant="outline" className="border-primary/20 hover:bg-primary/5">
                <Link href="/events">View All →</Link>
              </Button>
            </div>
            <CardDescription>Upcoming community events</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-primary/20 hover:shadow-md transition-all">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-secondary" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white ml-3">
                      <Link href={`/events`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No upcoming events at the moment</p>
                <Button asChild variant="outline">
                  <Link href="/events">Browse All Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Community Connection */}
      <Card className="elevated-card border-t-4 border-t-pink">
        <CardHeader className="bg-gradient-to-r from-pink/5 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-pink to-primary rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            Stay Connected
          </CardTitle>
          <CardDescription>Tips for getting the most out of your membership</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <h4 className="font-semibold text-gray-900 mb-2">📅 Attend Events</h4>
              <p className="text-sm text-gray-600">Join our cultural celebrations and community gatherings</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
              <h4 className="font-semibold text-gray-900 mb-2">👥 Connect</h4>
              <p className="text-sm text-gray-600">Meet other Tamil families in Jacksonville area</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
              <h4 className="font-semibold text-gray-900 mb-2">🎯 Update Profile</h4>
              <p className="text-sm text-gray-600">Keep your information current for better communication</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}