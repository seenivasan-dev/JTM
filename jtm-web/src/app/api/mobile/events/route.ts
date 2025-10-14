// JTM Web - Mobile Events API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    // Build where clause based on includeExpired parameter
    const whereClause = includeExpired ? {} : {
      date: {
        gte: new Date(), // Only future events
      },
    }

    // Fetch real events from database
    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc', // Show most recent first (including expired)
      },
      take: limit,
      include: {
        _count: {
          select: {
            rsvpResponses: true,
          },
        },
      },
    })

    // Format events for mobile consumption
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      rsvpRequired: event.rsvpRequired,
      rsvpDeadline: event.rsvpDeadline,
      maxParticipants: event.maxParticipants,
      currentAttendees: event._count.rsvpResponses,
      flyer: event.flyer,
      rsvpForm: event.rsvpForm,
      createdAt: event.createdAt
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('Error fetching mobile events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}