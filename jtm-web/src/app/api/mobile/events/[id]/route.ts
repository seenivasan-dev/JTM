// JTM Web - Mobile Single Event API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch the event from database
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rsvpResponses: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Format event for mobile consumption
    const formattedEvent = {
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
      createdAt: event.createdAt,
    }

    // TODO: Check user's RSVP status if authenticated
    // For now, return null rsvpStatus
    return NextResponse.json({
      event: formattedEvent,
      rsvpStatus: null,
    })
  } catch (error) {
    console.error('Error fetching event details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
