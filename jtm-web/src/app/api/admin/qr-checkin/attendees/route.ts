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

    // Admin check is optional
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email || '' }
      })
    } catch (error) {
      console.warn('Admin check skipped:', error)
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Get all attendees for the event
    const attendees = await prisma.qRAttendee.findMany({
      where: {
        eventId: eventId
      },
      include: {
        checkIn: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data
    const formattedAttendees = attendees.map(att => ({
      id: att.id,
      name: att.name,
      email: att.email,
      adults: att.adults,
      kids: att.kids,
      adultVegFood: att.adultVegFood,
      adultNonVegFood: att.adultNonVegFood,
      kidsFood: att.kidsFood,
      emailStatus: att.emailStatus,
      emailSentAt: att.emailSentAt,
      emailRetryCount: att.emailRetryCount,
      errorMessage: att.errorMessage,
      isCheckedIn: !!att.checkIn,
      checkedInAt: att.checkIn?.checkedInAt
    }))

    return NextResponse.json({ attendees: formattedAttendees })

  } catch (error) {
    console.error('Get attendees error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attendees' },
      { status: 500 }
    )
  }
}
