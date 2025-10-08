import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get real-time dashboard statistics
    const [
      totalMembers, 
      activeMembers, 
      inactiveMembers, 
      pendingRenewals, 
      recentRegistrations,
      totalEvents,
      upcomingEvents,
      totalRSVPs,
      pendingRSVPs,
      checkedInRSVPs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.membershipRenewal.count({ where: { status: 'PENDING' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.event.count(),
      prisma.event.count({
        where: {
          date: {
            gte: new Date(),
          },
        },
      }),
      prisma.rSVPResponse.count(),
      prisma.rSVPResponse.count({
        where: {
          paymentConfirmed: false,
        },
      }),
      prisma.rSVPResponse.count({
        where: {
          checkedIn: true,
        },
      }),
    ])

    return NextResponse.json({
      totalMembers,
      activeMembers,
      inactiveMembers,
      pendingRenewals,
      recentRegistrations,
      totalEvents,
      upcomingEvents,
      totalRSVPs,
      pendingRSVPs,
      checkedInRSVPs,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}