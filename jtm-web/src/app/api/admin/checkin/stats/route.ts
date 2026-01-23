import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    // Get total RSVPs with QR codes
    const totalQRCodes = await prisma.rSVPQRCode.count({
      where: {
        rsvpResponse: {
          eventId: eventId
        }
      }
    })

    // Get checked in count
    const checkedInCount = await prisma.eventCheckIn.count({
      where: {
        eventId: eventId
      }
    })

    // Get all QR codes with responses for food coupon calculation
    const allQRCodes = await prisma.rSVPQRCode.findMany({
      where: {
        rsvpResponse: {
          eventId: eventId
        }
      },
      include: {
        rsvpResponse: true,
        checkIn: true
      }
    })

    // Calculate total food coupons needed (each person + their guests)
    const totalFoodCoupons = allQRCodes.reduce((sum, qr) => {
      const numberOfGuests = (qr.rsvpResponse.responses as any)?.numberOfGuests || 0
      return sum + 1 + numberOfGuests // 1 for person + guests
    }, 0)

    // Calculate food coupons given
    const foodCouponsGiven = allQRCodes.reduce((sum, qr) => {
      if (qr.checkIn?.foodTokenGiven) {
        const numberOfGuests = (qr.rsvpResponse.responses as any)?.numberOfGuests || 0
        return sum + 1 + numberOfGuests
      }
      return sum
    }, 0)

    const pending = totalQRCodes - checkedInCount
    const percentageComplete = totalQRCodes > 0 
      ? Math.round((checkedInCount / totalQRCodes) * 100) 
      : 0

    // Get recent check-ins (last 50)
    const recentCheckIns = await prisma.eventCheckIn.findMany({
      where: {
        eventId: eventId
      },
      include: {
        qrCode: {
          include: {
            rsvpResponse: {
              include: {
                user: true
              }
            }
          }
        },
        admin: true
      },
      orderBy: {
        checkedInAt: 'desc'
      },
      take: 50
    })

    const formattedCheckIns = recentCheckIns.map(checkIn => ({
      id: checkIn.id,
      userName: `${checkIn.qrCode.rsvpResponse.user.firstName} ${checkIn.qrCode.rsvpResponse.user.lastName}`,
      userEmail: checkIn.qrCode.rsvpResponse.user.email,
      checkedInAt: checkIn.checkedInAt,
      foodTokenGiven: checkIn.foodTokenGiven,
      adminName: checkIn.admin.name || `${checkIn.admin.firstName} ${checkIn.admin.lastName}`,
      numberOfGuests: (checkIn.qrCode.rsvpResponse.responses as any)?.numberOfGuests || 0
    }))

    return NextResponse.json({
      stats: {
        total: totalQRCodes,
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
