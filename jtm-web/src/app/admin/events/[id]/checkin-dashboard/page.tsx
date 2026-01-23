'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RotateCw, Users, CheckCircle, Clock, XCircle, UtensilsCrossed } from 'lucide-react'

interface CheckInStats {
  total: number
  checkedIn: number
  pending: number
  percentageComplete: number
  totalFoodCoupons: number
  foodCouponsGiven: number
}

interface CheckInRecord {
  id: string
  userName: string
  userEmail: string
  checkedInAt: string
  foodTokenGiven: boolean
  adminName: string
  numberOfGuests: number
}

export default function CheckInDashboard({ params }: { params: { id: string } }) {
  const [stats, setStats] = useState<CheckInStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentageComplete: 0
  })
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([])
  const [loading, setLoading] = useState(true)

  const eventId = params.id

  const fetchDashboardData = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/checkin/stats?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentCheckIns(data.recentCheckIns)
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000)
    
    return () => clearInterval(interval)
  }, [eventId])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-In Dashboard</h1>
            <p className="text-gray-600">Real-time event check-in monitoring</p>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <RotateCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Total RSVPs</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Checked In</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.checkedIn}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
              <UtensilsCrossed className="w-4 h-4" />
              <span>{stats.foodCouponsGiven} of {stats.totalFoodCoupons} coupons given</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-700">Pending</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Check-In Progress</h3>
              <p className="text-sm text-purple-600">Overall completion rate</p>
            </div>
            <div className="text-4xl font-bold text-purple-900">{stats.percentageComplete}%</div>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentageComplete}%` }}
            />
          </div>
        </Card>

        {/* Recent Check-Ins */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Check-Ins</h2>
          
          {recentCheckIns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No check-ins yet</p>
              <p className="text-sm">Check-ins will appear here in real-time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Checked In At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Food Coupons</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCheckIns.map((checkIn) => (
                    <tr key={checkIn.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{checkIn.userName}</td>
                      <td className="py-3 px-4 text-gray-600">{checkIn.userEmail}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(checkIn.checkedInAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                          <UtensilsCrossed className="w-3 h-3 mr-1" />
                          {checkIn.numberOfGuests + 1}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {checkIn.foodTokenGiven ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Given</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{checkIn.adminName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
