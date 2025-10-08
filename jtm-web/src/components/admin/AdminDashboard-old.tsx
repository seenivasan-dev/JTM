'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserX, Clock, TrendingUp, Download, Calendar, BarChart3, Activity, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  pendingRenewals: number
  recentRegistrations: number
  totalEvents: number
  upcomingEvents: number
  totalRSVPs: number
  pendingRSVPs: number
  checkedInRSVPs: number
}

interface AdminDashboardProps {
  initialStats: DashboardStats
}

export default function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const [stats, setStats] = useState(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const refreshStats = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/dashboard-stats')
      if (response.ok) {
        const newStats = await response.json()
        setStats(newStats)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      description: 'All registered members',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+2.5%',
      trendUp: true,
    },
    {
      title: 'Active Members',
      value: stats.activeMembers,
      icon: UserCheck,
      description: 'Currently active members',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+5.2%',
      trendUp: true,
    },
    {
      title: 'Inactive Members',
      value: stats.inactiveMembers,
      icon: UserX,
      description: 'Pending activation',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '-1.3%',
      trendUp: false,
    },
    {
      title: 'Pending Renewals',
      value: stats.pendingRenewals,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '+8 this week',
      trendUp: true,
    },
    {
      title: 'New This Month',
      value: stats.recentRegistrations,
      icon: TrendingUp,
      description: 'Recent registrations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15.8%',
      trendUp: true,
    },
  ]

  const eventStatCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      description: 'All events created',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+3 this month',
      trendUp: true,
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Activity,
      description: 'Future events',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'Next: Tomorrow',
      trendUp: true,
    },
    {
      title: 'Total RSVPs',
      value: stats.totalRSVPs,
      icon: Users,
      description: 'All RSVP responses',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+12.4%',
      trendUp: true,
    },
    {
      title: 'Pending Payment',
      value: stats.pendingRSVPs,
      icon: Clock,
      description: 'Awaiting payment',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '5 urgent',
      trendUp: false,
    },
    {
      title: 'Checked In',
      value: stats.checkedInRSVPs,
      icon: UserCheck,
      description: 'Attended events',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '95% rate',
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={refreshStats} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      description: 'All registered members',
      color: 'text-blue-600',
    },
    {
      title: 'Active Members',
      value: stats.activeMembers,
      icon: UserCheck,
      description: 'Currently active members',
      color: 'text-green-600',
    },
    {
      title: 'Inactive Members',
      value: stats.inactiveMembers,
      icon: UserX,
      description: 'Pending activation',
      color: 'text-red-600',
    },
    {
      title: 'Pending Renewals',
      value: stats.pendingRenewals,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'text-yellow-600',
    },
    {
      title: 'New This Month',
      value: stats.recentRegistrations,
      icon: TrendingUp,
      description: 'Recent registrations',
      color: 'text-purple-600',
    },
  ]

  const eventStatCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      description: 'All events created',
      color: 'text-blue-600',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      description: 'Future events',
      color: 'text-green-600',
    },
    {
      title: 'Total RSVPs',
      value: stats.totalRSVPs,
      icon: Users,
      description: 'All RSVP responses',
      color: 'text-purple-600',
    },
    {
      title: 'Pending Payment',
      value: stats.pendingRSVPs,
      icon: Clock,
      description: 'Awaiting payment',
      color: 'text-yellow-600',
    },
    {
      title: 'Checked In',
      value: stats.checkedInRSVPs,
      icon: UserCheck,
      description: 'Attended events',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Member Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Member Statistics</h2>
          <Badge variant="outline" className="text-xs">
            Real-time data
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <Badge variant={stat.trendUp ? "default" : "secondary"} className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Event & RSVP Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Event & RSVP Analytics</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {eventStatCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <Badge variant={stat.trendUp ? "default" : "secondary"} className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button asChild className="h-auto flex-col gap-2 p-4">
              <Link href="/admin/members">
                <Users className="h-6 w-6" />
                <span className="text-xs">Manage Members</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/admin/events">
                <Calendar className="h-6 w-6" />
                <span className="text-xs">Manage Events</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/events/create">
                <TrendingUp className="h-6 w-6" />
                <span className="text-xs">Create Event</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/admin/renewals">
                <Clock className="h-6 w-6" />
                <span className="text-xs">Review Renewals</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/admin/bulk-import">
                <Download className="h-6 w-6" />
                <span className="text-xs">Bulk Import</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link href="/admin/analytics">
                <BarChart3 className="h-6 w-6" />
                <span className="text-xs">Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest member registrations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RecentActivity />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <PendingActions stats={stats} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RecentActivity() {
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/users?limit=5&sort=createdAt')
      .then(res => res.json())
      .then(data => setRecentUsers(data.users || []))
      .catch(console.error)
  }, [])

  return (
    <>
      {recentUsers.map((user: any) => (
        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Active" : "Pending"}
          </Badge>
        </div>
      ))}
      {recentUsers.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
      )}
    </>
  )
}

function PendingActions({ stats }: { stats: DashboardStats }) {
  return (
    <>
      {stats.inactiveMembers > 0 && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <UserX className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {stats.inactiveMembers} members awaiting activation
              </p>
              <p className="text-xs text-red-600">Review and activate new members</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/admin/members?status=inactive">Review</Link>
          </Button>
        </div>
      )}
      
      {stats.pendingRenewals > 0 && (
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {stats.pendingRenewals} renewal requests pending
              </p>
              <p className="text-xs text-yellow-600">Process membership renewals</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/admin/renewals">Process</Link>
          </Button>
        </div>
      )}
      
      {stats.pendingRSVPs > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                {stats.pendingRSVPs} RSVPs pending payment
              </p>
              <p className="text-xs text-blue-600">Follow up on event payments</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/admin/events">View Events</Link>
          </Button>
        </div>
      )}

      {stats.inactiveMembers === 0 && stats.pendingRenewals === 0 && stats.pendingRSVPs === 0 && (
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">All caught up!</p>
          <p className="text-xs text-green-600">No pending actions at this time</p>
        </div>
      )}
    </>
  )
}
    </div>
  )
}
}

function RecentActivity() {
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    fetch('/api/users?limit=5&sort=createdAt')
      .then(res => res.json())
      .then(data => setRecentUsers(data.users || []))
      .catch(console.error)
  }, [])

  return (
    <>
      {recentUsers.map((user: any) => (
        <div key={user.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Active" : "Pending"}
          </Badge>
        </div>
      ))}
    </>
  )
}

function PendingActions({ stats }: { stats: DashboardStats }) {
  return (
    <>
      {stats.inactiveMembers > 0 && (
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-red-800">
              {stats.inactiveMembers} members awaiting activation
            </p>
            <p className="text-xs text-red-600">Review and activate new members</p>
          </div>
          <Button size="sm" asChild>
            <Link href="/admin/members?status=inactive">Review</Link>
          </Button>
        </div>
      )}
      
      {stats.pendingRenewals > 0 && (
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {stats.pendingRenewals} renewal requests pending
            </p>
            <p className="text-xs text-yellow-600">Process membership renewals</p>
          </div>
          <Button size="sm" asChild>
            <Link href="/admin/renewals">Process</Link>
          </Button>
        </div>
      )}
    </>
  )
}