'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download,
  CalendarDays,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface RSVPReportsProps {
  event: {
    id: string
    title: string
    date: string
    location: string
    maxParticipants?: number | null
    rsvpDeadline?: string | null
    rsvpForm?: {
      fields: Array<{
        id: string
        type: string
        label: string
        required: boolean
        options?: string[]
      }>
    }
  }
  rsvps: Array<{
    id: string
    responses: Record<string, any>
    paymentReference?: string | null
    paymentConfirmed: boolean
    checkedIn: boolean
    checkedInAt?: string | null
    createdAt: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      membershipType?: string
    }
  }>
}

export default function RSVPReports({ event, rsvps }: RSVPReportsProps) {
  // Calculate statistics
  const stats = {
    total: rsvps.length,
    paymentApproved: rsvps.filter(r => r.paymentConfirmed).length,
    paymentPending: rsvps.filter(r => !r.paymentConfirmed).length,
    checkedIn: rsvps.filter(r => r.checkedIn).length,
    notCheckedIn: rsvps.filter(r => !r.checkedIn).length,
    
    // Membership breakdown
    individual: rsvps.filter(r => r.user.membershipType === 'INDIVIDUAL').length,
    family: rsvps.filter(r => r.user.membershipType === 'FAMILY').length,
    custom: rsvps.filter(r => r.user.membershipType === 'CUSTOM').length,
    
    // Time-based stats
    rsvpsLast24h: rsvps.filter(r => {
      const diff = Date.now() - new Date(r.createdAt).getTime()
      return diff < 24 * 60 * 60 * 1000
    }).length,
    
    rsvpsLast7d: rsvps.filter(r => {
      const diff = Date.now() - new Date(r.createdAt).getTime()
      return diff < 7 * 24 * 60 * 60 * 1000
    }).length,
  }

  // Calculate capacity percentage
  const capacityPercentage = event.maxParticipants 
    ? Math.round((stats.total / event.maxParticipants) * 100)
    : null

  // Generate detailed CSV
  const exportDetailedReport = () => {
    // Build dynamic headers from RSVP form fields
    const dynamicFieldHeaders = event.rsvpForm?.fields?.map(f => f.label) || []
    const headers = [
      'Name', 'Email', 'Membership Type', 'RSVP Date', 'Payment Status',
      'Payment Reference', ...dynamicFieldHeaders, 'Check-in Status', 'Check-in Time'
    ]

    // Build field ID to label map
    const fieldMap = new Map<string, string>()
    event.rsvpForm?.fields?.forEach(f => fieldMap.set(f.id, f.label))

    const csvData = [
      headers,
      ...rsvps.map(rsvp => {
        // Get dynamic field values in the same order as headers
        const dynamicValues = event.rsvpForm?.fields?.map(field => {
          const value = rsvp.responses[field.id]
          if (value === undefined || value === null) return 'N/A'
          if (typeof value === 'boolean') return value ? 'Yes' : 'No'
          return String(value)
        }) || []

        return [
          `${rsvp.user.firstName} ${rsvp.user.lastName}`,
          rsvp.user.email,
          rsvp.user.membershipType || 'N/A',
          new Date(rsvp.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          rsvp.paymentConfirmed ? 'Approved' : 'Pending',
          rsvp.paymentReference || 'N/A',
          ...dynamicValues,
          rsvp.checkedIn ? 'Checked In' : 'Not Checked In',
          rsvp.checkedInAt 
            ? new Date(rsvp.checkedInAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'N/A'
        ]
      })
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_detailed_report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Generate summary report
  const exportSummaryReport = () => {
    const summary = [
      ['JTM Event Report Summary'],
      [''],
      ['Event Details'],
      ['Event Name', event.title],
      ['Event Date', new Date(event.date).toLocaleString('en-US')],
      ['Location', event.location],
      [''],
      ['RSVP Statistics'],
      ['Total RSVPs', stats.total.toString()],
      ['Payment Approved', stats.paymentApproved.toString()],
      ['Payment Pending', stats.paymentPending.toString()],
      ['Checked In', stats.checkedIn.toString()],
      ['Not Checked In', stats.notCheckedIn.toString()],
      [''],
      ['Membership Breakdown'],
      ['Individual Members', stats.individual.toString()],
      ['Family Members', stats.family.toString()],
      ['Custom Members', stats.custom.toString()],
      [''],
      ['Recent Activity'],
      ['RSVPs in Last 24h', stats.rsvpsLast24h.toString()],
      ['RSVPs in Last 7 Days', stats.rsvpsLast7d.toString()],
    ]
    
    if (event.maxParticipants) {
      summary.push([''], ['Capacity'], ['Max Capacity', event.maxParticipants.toString()], ['Current Occupancy', `${capacityPercentage}%`])
    }
    
    const csvContent = summary.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_summary_report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} • {event.location}
        </p>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3">
        <Button onClick={exportDetailedReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Detailed Report
        </Button>
        <Button onClick={exportSummaryReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Summary
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            {event.maxParticipants && (
              <p className="text-xs text-muted-foreground">
                {capacityPercentage}% of {event.maxParticipants} capacity
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paymentApproved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.paymentApproved / stats.total) * 100) : 0}% approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}% attended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Status
          </CardTitle>
          <CardDescription>Track payment approvals and pending reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paymentApproved}</p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  {stats.total > 0 ? Math.round((stats.paymentApproved / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.paymentPending}</p>
                </div>
                <Badge variant="secondary">
                  {stats.total > 0 ? Math.round((stats.paymentPending / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Badge variant="outline">100%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Check-in Status
          </CardTitle>
          <CardDescription>Monitor event attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Checked In</p>
                  <p className="text-sm text-muted-foreground">
                    Attendees who have checked in
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.paymentApproved > 0 
                    ? Math.round((stats.checkedIn / stats.paymentApproved) * 100) 
                    : 0}% of approved
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Not Checked In</p>
                  <p className="text-sm text-muted-foreground">
                    Approved but not yet checked in
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.paymentApproved - stats.checkedIn}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expected attendees
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membership Breakdown
          </CardTitle>
          <CardDescription>Attendee distribution by membership type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Individual</Badge>
                <span className="text-sm text-muted-foreground">members</span>
              </div>
              <span className="font-semibold">{stats.individual}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Family</Badge>
                <span className="text-sm text-muted-foreground">members</span>
              </div>
              <span className="font-semibold">{stats.family}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Custom</Badge>
                <span className="text-sm text-muted-foreground">members</span>
              </div>
              <span className="font-semibold">{stats.custom}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>RSVP momentum and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Last 24 Hours</p>
              <p className="text-2xl font-bold">{stats.rsvpsLast24h}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 
                  ? Math.round((stats.rsvpsLast24h / stats.total) * 100) 
                  : 0}% of total RSVPs
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Last 7 Days</p>
              <p className="text-2xl font-bold">{stats.rsvpsLast7d}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 
                  ? Math.round((stats.rsvpsLast7d / stats.total) * 100) 
                  : 0}% of total RSVPs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings/Alerts */}
      {(event.maxParticipants && capacityPercentage && capacityPercentage > 90) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <XCircle className="h-5 w-5" />
              Capacity Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              Event is at {capacityPercentage}% capacity ({stats.total} of {event.maxParticipants} spots filled). 
              Consider stopping new RSVPs or increasing capacity.
            </p>
          </CardContent>
        </Card>
      )}

      {stats.paymentPending > stats.paymentApproved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              Payment Approvals Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              {stats.paymentPending} RSVPs are awaiting payment approval. Review pending payments to send QR codes to attendees.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
