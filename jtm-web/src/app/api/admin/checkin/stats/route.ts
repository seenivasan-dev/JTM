import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Get total RSVPs
    const totalRSVPs = await prisma.rSVPResponse.count({
      where: {
        eventId: eventId
      }
    })

    // Get checked in count
    const checkedInCount = await prisma.rSVPResponse.count({
      where: {
        eventId: eventId,
        checkedIn: true
      }
    })

    // Get all RSVPs with responses for food coupon calculation
    const allRSVPs = await prisma.rSVPResponse.findMany({
      where: {
        eventId: eventId
      },
      include: {
        user: true
      }
    })

    // Calculate total food coupons needed (each person + their guests)
    const totalFoodCoupons = allRSVPs.reduce((sum, rsvp) => {
      const numberOfGuests = (rsvp.responses as any)?.numberOfGuests || 0
      return sum + 1 + numberOfGuests // 1 for person + guests
    }, 0)

    // Calculate food coupons given
    const foodCouponsGiven = allRSVPs.reduce((sum, rsvp) => {
      const responses = rsvp.responses as any
      if (rsvp.checkedIn && responses?.foodTokenGiven) {
        const numberOfGuests = responses?.numberOfGuests || 0
        return sum + 1 + numberOfGuests
      }
      return sum
    }, 0)

    const pending = totalRSVPs - checkedInCount
    const percentageComplete = totalRSVPs > 0 
      ? Math.round((checkedInCount / totalRSVPs) * 100) 
      : 0

    // Get recent check-ins (last 50)
    const recentCheckIns = await prisma.rSVPResponse.findMany({
      where: {
        eventId: eventId,
        checkedIn: true
      },
      include: {
        user: true
      },
      orderBy: {
        checkedInAt: 'desc'
      },
      take: 50
    })

    const formattedCheckIns = recentCheckIns.map(rsvp => {
      const responses = rsvp.responses as any
      return {
        id: rsvp.id,
        userName: `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        userEmail: rsvp.user.email,
        checkedInAt: rsvp.checkedInAt,
        foodTokenGiven: responses?.foodTokenGiven || false,
        adminName: responses?.checkedInByName || 'Admin',
        numberOfGuests: responses?.numberOfGuests || 0
      }
    })

    return NextResponse.json({
      stats: {
        total: totalRSVPs,
        checkedIn: checkedInCount,
        pending: pending,
        percentageComplete: percentageComplete,
        totalFoodCoupons: totalFoodCoupons,
        foodCouponsGiven: foodCouponsGiven
      },
      recentCheckIns: formattedCheckIns
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get stats' },
      { status: 500 }
    )
  }
}
