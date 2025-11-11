'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Download,
  RefreshCw,
  PieChart,
  Activity,
  DollarSign,
  UserCheck,
  Clock,
  CheckCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

interface AnalyticsData {
  membershipTypeStats: Array<{
    membershipType: string
    _count: { membershipType: number }
  }>
  monthlyRegistrations: Array<{
    createdAt: string
  }>
  eventAttendanceStats: Array<{
    id: string
    title: string
    date: string
    maxParticipants: number | null
    _count: { rsvpResponses: number }
  }>
  topEvents: Array<{
    id: string
    title: string
    date: string
    _count: { rsvpResponses: number }
  }>
  rsvpStats: Array<{
    paymentConfirmed: boolean
    checkedIn: boolean
    _count: { id: number }
  }>
  // Enhanced analytics data
  totalMembers: number
  activeMembers: number
  totalEvents: number
  totalRSVPs: number
  avgEventAttendance: number
  membershipGrowthRate: number
  eventEngagementRate: number
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedMetric, setSelectedMetric] = useState('registrations')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Process monthly registration data
  const monthlyData = (data?.monthlyRegistrations || []).reduce((acc: Record<string, number>, user) => {
    const month = new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  // Process RSVP data with type safety
  const rsvpSummary = (data?.rsvpStats || []).reduce((acc: {
    paidAndCheckedIn: number
    paidNotCheckedIn: number
    notPaidButCheckedIn: number
    notPaidNotCheckedIn: number
  }, stat) => {
    if (stat.paymentConfirmed && stat.checkedIn) {
      acc.paidAndCheckedIn = stat._count.id
    } else if (stat.paymentConfirmed && !stat.checkedIn) {
      acc.paidNotCheckedIn = stat._count.id
    } else if (!stat.paymentConfirmed && stat.checkedIn) {
      acc.notPaidButCheckedIn = stat._count.id
    } else {
      acc.notPaidNotCheckedIn = stat._count.id
    }
    return acc
  }, {
    paidAndCheckedIn: 0,
    paidNotCheckedIn: 0,
    notPaidButCheckedIn: 0,
    notPaidNotCheckedIn: 0,
  })

  const totalRSVPs = Object.values(rsvpSummary).reduce((sum: number, count: number) => sum + count, 0)

  const handleExport = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Members', (data?.totalMembers || 0).toString()],
      ['Active Members', (data?.activeMembers || 0).toString()],
      ['Total Events', (data?.totalEvents || 0).toString()],
      ['Total RSVPs', totalRSVPs.toString()],
      ['Average Event Attendance', (data?.avgEventAttendance || 0).toString()],
      ['Membership Growth Rate', `${(data?.membershipGrowthRate || 0).toFixed(2)}%`],
      ['Event Engagement Rate', `${(data?.eventEngagementRate || 0).toFixed(2)}%`],
      ...(data?.membershipTypeStats || []).map(stat => [stat.membershipType, stat._count.membershipType.toString()])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    // This would refresh the data from the server
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights and reporting for informed decision making"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.totalMembers || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              {(data?.membershipGrowthRate || 0).toFixed(1)}% growth
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Engagement</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.eventEngagementRate || 0).toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="h-3 w-3 mr-1" />
              Member participation rate
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.avgEventAttendance || 0).toFixed(0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1" />
              Per event
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalEvents || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Total created
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Membership Distribution
                </CardTitle>
                <CardDescription>Breakdown by membership type</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.membershipTypeStats || []).map((stat) => {
                const totalMembers = data?.totalMembers || 0
                const percentage = totalMembers > 0 ? (stat._count.membershipType / totalMembers) * 100 : 0
                return (
                  <div key={stat.membershipType} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium capitalize">{stat.membershipType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="min-w-[60px] justify-center">
                        {stat._count.membershipType}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Growth Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Trends
            </CardTitle>
            <CardDescription>Monthly registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(monthlyData)
                .slice(-6)
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month}</span>
                    <Badge variant="outline" className="text-xs">
                      +{count} new members
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Event Performance
            </CardTitle>
            <CardDescription>Attendance rates by event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.eventAttendanceStats || []).slice(0, 5).map((event) => {
                const attendanceRate = event.maxParticipants 
                  ? (event._count.rsvpResponses / event.maxParticipants) * 100 
                  : 0
                return (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{event.title}</span>
                      <Badge variant={attendanceRate > 80 ? "default" : attendanceRate > 50 ? "secondary" : "outline"}>
                        {attendanceRate.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          attendanceRate > 80 ? 'bg-green-500' : 
                          attendanceRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Top Events
            </CardTitle>
            <CardDescription>Most popular events by RSVPs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.topEvents || []).slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {event._count.rsvpResponses} RSVPs
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RSVP Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            RSVP Payment & Attendance Analysis
          </CardTitle>
          <CardDescription>Payment confirmation and check-in rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{rsvpSummary.paidAndCheckedIn}</div>
              <div className="text-sm text-green-700">Paid & Attended</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{rsvpSummary.paidNotCheckedIn}</div>
              <div className="text-sm text-yellow-700">Paid & No-Show</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{rsvpSummary.notPaidButCheckedIn}</div>
              <div className="text-sm text-blue-700">Unpaid & Attended</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{rsvpSummary.notPaidNotCheckedIn}</div>
              <div className="text-sm text-red-700">Unpaid & No-Show</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Payment Collection Rate</span>
              <span className="font-medium">
                {totalRSVPs > 0 ? Math.round(((rsvpSummary.paidAndCheckedIn + rsvpSummary.paidNotCheckedIn) / totalRSVPs) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalRSVPs > 0 ? ((rsvpSummary.paidAndCheckedIn + rsvpSummary.paidNotCheckedIn) / totalRSVPs) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}