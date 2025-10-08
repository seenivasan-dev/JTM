'use client'

import React, { useState } from 'react'
import { Card, CardContent, Ca  // Process RSVP data
  const rsvpSummary = data.rsvpStats.reduce((acc: {
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

  const totalRSVPs = Object.values(rsvpSummary).reduce((sum: number, count: number) => sum + count, 0)eader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Download,
  Filter,
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

  // Process monthly registration data
  const monthlyData = data.monthlyRegistrations.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Process RSVP data
  const rsvpSummary = data.rsvpStats.reduce((acc, stat) => {
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

  // Calculate key metrics
  const totalMembers = data.membershipTypeStats.reduce((sum, stat) => sum + stat._count.membershipType, 0)
  const totalRSVPs = Object.values(rsvpSummary).reduce((sum, count) => sum + count, 0)
  const totalEvents = data.eventAttendanceStats.length
  const avgAttendanceRate = data.eventAttendanceStats.reduce((sum, event) => {
    const rate = event.maxParticipants ? (event._count.rsvpResponses / event.maxParticipants) * 100 : 0
    return sum + rate
  }, 0) / Math.max(data.eventAttendanceStats.length, 1)

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Members', totalMembers.toString()],
      ['Total Events', totalEvents.toString()],
      ['Total RSVPs', totalRSVPs.toString()],
      ['Average Attendance Rate', `${avgAttendanceRate.toFixed(1)}%`],
      ...data.membershipTypeStats.map(stat => 
        [`${stat.membershipType} Members`, stat._count.membershipType.toString()]
      )
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jtm_analytics_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights about your community members and events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              +{data.monthlyRegistrations.length} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last 3 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRSVPs}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Event capacity filled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="registrations">Registrations</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="rsvps">RSVPs</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Membership Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Membership Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of membership types in your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.membershipTypeStats.map((stat) => {
                const percentage = ((stat._count.membershipType / totalMembers) * 100).toFixed(1)
                return (
                  <div key={stat.membershipType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{stat.membershipType.toLowerCase()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                        <Badge variant="secondary">{stat._count.membershipType}</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
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
              <TrendingUp className="h-5 w-5" />
              Monthly Registrations
            </CardTitle>
            <CardDescription>
              Member registration trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(monthlyData)
                .slice(-6)
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                    <span className="font-medium">{month}</span>
                    <Badge variant="outline">{count} new members</Badge>
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
              <Calendar className="h-5 w-5" />
              Recent Event Performance
            </CardTitle>
            <CardDescription>
              Attendance rates for recent events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.eventAttendanceStats.slice(0, 8).map((event) => {
                const attendanceRate = event.maxParticipants 
                  ? Math.round((event._count.rsvpResponses / event.maxParticipants) * 100)
                  : 0
                
                return (
                  <div key={event.id} className="space-y-2 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.title}</span>
                      <Badge variant={attendanceRate > 80 ? "default" : attendanceRate > 50 ? "secondary" : "destructive"}>
                        {event._count.rsvpResponses} RSVPs
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                      <span>
                        {event.maxParticipants ? `${attendanceRate}% filled` : 'No limit set'}
                      </span>
                    </div>
                    {event.maxParticipants && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            attendanceRate > 80 ? 'bg-green-500' : 
                            attendanceRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performing Events
            </CardTitle>
            <CardDescription>
              Most popular events based on RSVP count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <Badge>{event._count.rsvpResponses} RSVPs</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RSVP & Payment Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            RSVP & Payment Analytics
          </CardTitle>
          <CardDescription>
            Payment and check-in status breakdown for all RSVPs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{rsvpSummary.paidAndCheckedIn}</div>
              <div className="text-sm text-green-800">Paid & Checked In</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{rsvpSummary.paidNotCheckedIn}</div>
              <div className="text-sm text-yellow-800">Paid, Not Checked In</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{rsvpSummary.notPaidButCheckedIn}</div>
              <div className="text-sm text-blue-800">Not Paid, Checked In</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{rsvpSummary.notPaidNotCheckedIn}</div>
              <div className="text-sm text-red-800">Not Paid, Not Checked In</div>
            </div>
          </div>
          
          {/* Payment completion rate */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Payment Completion Rate</span>
              <span className="text-sm text-muted-foreground">
                {totalRSVPs > 0 ? Math.round(((rsvpSummary.paidAndCheckedIn + rsvpSummary.paidNotCheckedIn) / totalRSVPs) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${totalRSVPs > 0 ? ((rsvpSummary.paidAndCheckedIn + rsvpSummary.paidNotCheckedIn) / totalRSVPs) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}