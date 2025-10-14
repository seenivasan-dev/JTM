// JTM Web - Manual Event Check-in API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, eventId } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found with this email address' },
        { status: 404 }
      )
    }

    // Find the RSVP response for this user and event
    const rsvp = await prisma.rSVPResponse.findFirst({
      where: {
        userId: user.id,
        ...(eventId && { eventId: eventId })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          }
        }
      },
    })

    if (!rsvp) {
      return NextResponse.json(
        { success: false, error: 'No RSVP found for this user and event' },
        { status: 404 }
      )
    }

    // Check if event has expired
    const now = new Date()
    if (rsvp.event.date < now) {
      return NextResponse.json(
        { success: false, error: 'This event has expired and check-in is no longer available' },
        { status: 400 }
      )
    }

    // Check if payment is confirmed (if payment was required)
    if (rsvp.paymentReference && !rsvp.paymentConfirmed) {
      return NextResponse.json(
        { success: false, error: 'Payment not confirmed for this RSVP' },
        { status: 400 }
      )
    }

    // Check if already checked in
    if (rsvp.checkedIn) {
      return NextResponse.json({
        success: true,
        message: 'Already checked in',
        alreadyCheckedIn: true,
        rsvp: {
          id: rsvp.id,
          user: rsvp.user,
          event: rsvp.event,
          checkedInAt: rsvp.checkedInAt,
        },
        attendee: {
          name: `${rsvp.user.firstName} ${rsvp.user.lastName}`,
          email: rsvp.user.email
        }
      })
    }

    // Update check-in status
    const updatedRSVP = await prisma.rSVPResponse.update({
      where: { id: rsvp.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully checked in',
      rsvp: {
        id: updatedRSVP.id,
        user: updatedRSVP.user,
        event: updatedRSVP.event,
        checkedInAt: updatedRSVP.checkedInAt,
      },
      attendee: {
        name: `${updatedRSVP.user.firstName} ${updatedRSVP.user.lastName}`,
        email: updatedRSVP.user.email
      }
    })

  } catch (error) {
    console.error('Manual check-in error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}