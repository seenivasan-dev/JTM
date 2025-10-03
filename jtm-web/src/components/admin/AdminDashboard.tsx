'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserX, Clock, TrendingUp, Download } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  pendingRenewals: number
  recentRegistrations: number
}

interface AdminDashboardProps {
  initialStats: DashboardStats
}

export default function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const [stats, setStats] = useState(initialStats)

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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/admin/members">
              <Users className="mr-2 h-4 w-4" />
              Manage Members
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/renewals">
              <Clock className="mr-2 h-4 w-4" />
              Review Renewals
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/bulk-import">
              <Download className="mr-2 h-4 w-4" />
              Bulk Import
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest member sign-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <RecentActivity />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
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