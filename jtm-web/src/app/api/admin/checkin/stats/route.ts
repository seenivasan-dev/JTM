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

    // Calculate food totals from structured fields (new) with fallback to legacy numberOfGuests
    const foodStats = allRSVPs.reduce((acc, rsvp) => {
      const hasStructuredFood = rsvp.vegCount > 0 || rsvp.nonVegCount > 0 || rsvp.kidsCount > 0 || rsvp.noFood
      const responses = rsvp.responses as any

      if (hasStructuredFood || rsvp.noFood) {
        // New structured food data
        acc.totalVeg += rsvp.vegCount
        acc.totalNonVeg += rsvp.nonVegCount
        acc.totalKids += rsvp.kidsCount
        if (rsvp.noFood) acc.totalNoFood += 1

        if (rsvp.checkedIn && responses?.foodTokenGiven) {
          acc.vegGiven += rsvp.vegCount
          acc.nonVegGiven += rsvp.nonVegCount
          acc.kidsGiven += rsvp.kidsCount
        }
      } else {
        // Legacy: count 1 per RSVP + guests
        const guests = responses?.numberOfGuests || 0
        acc.totalVeg += 1 + guests
        if (rsvp.checkedIn && responses?.foodTokenGiven) {
          acc.vegGiven += 1 + guests
        }
      }

      return acc
    }, { totalVeg: 0, totalNonVeg: 0, totalKids: 0, totalNoFood: 0, vegGiven: 0, nonVegGiven: 0, kidsGiven: 0 })

    // Combined coupon totals for backward compatibility
    const totalFoodCoupons = foodStats.totalVeg + foodStats.totalNonVeg + foodStats.totalKids
    const foodCouponsGiven = foodStats.vegGiven + foodStats.nonVegGiven + foodStats.kidsGiven

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
        foodCouponsGiven: foodCouponsGiven,
        food: {
          totalVeg: foodStats.totalVeg,
          totalNonVeg: foodStats.totalNonVeg,
          totalKids: foodStats.totalKids,
          totalNoFood: foodStats.totalNoFood,
          vegGiven: foodStats.vegGiven,
          nonVegGiven: foodStats.nonVegGiven,
          kidsGiven: foodStats.kidsGiven,
        }
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
