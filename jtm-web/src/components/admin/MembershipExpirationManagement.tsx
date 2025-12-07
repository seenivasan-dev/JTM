// JTM Web - Membership Expiration Management Component
// Admin interface to view expiration status and manually trigger expiration

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  Zap
} from 'lucide-react'

interface ExpirationStatus {
  currentYear: number
  activeMembers: number
  expiredThisYear: boolean
  isExpirationDay: boolean
  nextExpirationDate: string
  daysUntilExpiration: number
}

export default function MembershipExpirationManagement() {
  const [status, setStatus] = useState<ExpirationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/membership-expiration')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.data)
      } else {
        setError('Failed to fetch expiration status')
      }
    } catch (err) {
      setError('Error fetching status')
    } finally {
      setLoading(false)
    }
  }

  const triggerManualExpiration = async () => {
    if (!confirm('⚠️ This will expire ALL active memberships immediately. Are you sure?')) {
      return
    }

    setTriggering(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/membership-expiration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.data.message)
        await fetchStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to expire memberships')
      }
    } catch (err) {
      setError('Error triggering expiration')
    } finally {
      setTriggering(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Automatic Membership Expiration
          </CardTitle>
          <CardDescription>
            Memberships automatically expire on January 1st at 12:01 AM every year. 
            The system checks hourly and triggers expiration automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          {status && (
            <>
              {/* Current Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Current Year</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{status.currentYear}</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Active Members</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{status.activeMembers}</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Days Until Expiration</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{status.daysUntilExpiration}</div>
                </div>
              </div>

              {/* Next Expiration Date */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Next Auto-Expiration Date</div>
                    <div className="text-lg font-semibold">{formatDate(status.nextExpirationDate)}</div>
                  </div>
                  {status.isExpirationDay && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Today is Expiration Day!
                    </Badge>
                  )}
                </div>
              </div>

              {/* Expiration Status */}
              <Alert>
                {status.expiredThisYear ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Memberships have already been expired this year ({status.currentYear}). 
                      Next automatic expiration will occur on {formatDate(status.nextExpirationDate)}.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      ⏳ Memberships have not expired yet this year. 
                      {status.isExpirationDay ? (
                        <span className="font-semibold"> The system is ready to trigger expiration automatically.</span>
                      ) : (
                        <span> Automatic expiration will occur in {status.daysUntilExpiration} days.</span>
                      )}
                    </AlertDescription>
                  </>
                )}
              </Alert>

              {/* How It Works */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  How Automatic Expiration Works
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Automatic Detection:</strong> System checks every hour if it's January 1st</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Enhanced Midnight Check:</strong> Between 12:00 AM - 12:10 AM, checks every minute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>One-Time Execution:</strong> Runs only once per year (prevents duplicate expiration)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Client-Side Trigger:</strong> Any active user session can trigger the check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>No Cron Job Required:</strong> Works automatically without external scheduling</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Messages */}
          {message && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={fetchStatus}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </Button>

            <Button
              onClick={triggerManualExpiration}
              disabled={triggering || status?.activeMembers === 0}
              variant="destructive"
              className="gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {triggering ? 'Expiring...' : 'Manual Expire All Members'}
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Warning:</strong> The "Manual Expire All Members" button will immediately expire 
              all active memberships, regardless of the date. Only use this for testing or emergency situations. 
              Normal expiration happens automatically on January 1st.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
