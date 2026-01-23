import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get admin, but allow check-in even without admin record
    let adminId = session.user.email || 'system'
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email || '' }
      })
      if (admin) {
        adminId = admin.id
      }
    } catch (error) {
      console.warn('Admin lookup failed, using email as ID:', error)
    }

    const { attendeeId, eventId } = await request.json()

    if (!attendeeId || !eventId) {
      return NextResponse.json({ error: 'Attendee ID and event ID required' }, { status: 400 })
    }

    // Verify attendee exists and belongs to this event
    const attendee = await prisma.qRAttendee.findFirst({
      where: {
        id: attendeeId,
        eventId: eventId
      }
    })

    if (!attendee) {
      return NextResponse.json({ error: 'Attendee not found for this event' }, { status: 404 })
    }

    // Check if already checked in
    const existingCheckIn = await prisma.qRCheckIn.findUnique({
      where: {
        attendeeId: attendeeId
      }
    })

    if (existingCheckIn) {
      return NextResponse.json({ error: 'Already checked in' }, { status: 400 })
    }

    // Create check-in record
    const checkIn = await prisma.qRCheckIn.create({
      data: {
        attendeeId: attendeeId,
        eventId: eventId,
        checkedInBy: adminId,
        foodCouponsGiven: true
      }
    })

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkIn.id,
        checkedInAt: checkIn.checkedInAt
      }
    })

  } catch (error) {
    console.error('Confirm check-in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm check-in' },
      { status: 500 }
    )
  }
}
