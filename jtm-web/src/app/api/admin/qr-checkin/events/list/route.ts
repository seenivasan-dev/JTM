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

    // Get all check-in events ordered by date (newest first)
    const events = await prisma.checkInEvent.findMany({
      orderBy: {
        date: 'desc'
      },
      include: {
        _count: {
          select: {
            attendees: true,
            checkIns: true
          }
        }
      }
    })

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      attendeeCount: event._count.attendees,
      checkInCount: event._count.checkIns
    }))

    return NextResponse.json({ events: formattedEvents })

  } catch (error) {
    console.error('List events error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list events' },
      { status: 500 }
    )
  }
}
