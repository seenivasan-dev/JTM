// JTM Mobile - Single Event Details API
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

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

    // Check user's RSVP status if userId provided
    let userRsvpStatus = null
    let paymentConfirmed = false
    if (userId) {
      const rsvp = await prisma.rSVPResponse.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId,
          },
        },
      })

      if (rsvp) {
        userRsvpStatus = (rsvp.responses as any)?.status || null
        paymentConfirmed = rsvp.paymentConfirmed
      }
    }

    // Format event for mobile consumption
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.date.toISOString().split('T')[1].substring(0, 5), // Extract time from date
      location: event.location,
      type: 'Community', // Default type since not in schema
      rsvpRequired: event.rsvpRequired,
      rsvpDeadline: event.rsvpDeadline,
      maxParticipants: event.maxParticipants,
      maxCapacity: event.maxParticipants,
      currentAttendees: event._count.rsvpResponses,
      rsvpCount: event._count.rsvpResponses,
      flyer: event.flyer,
      rsvpForm: event.rsvpForm,
      createdAt: event.createdAt,
    }

    return NextResponse.json({
      event: formattedEvent,
      rsvpStatus: userRsvpStatus,
      paymentConfirmed,
    })
  } catch (error) {
    console.error('Error fetching event details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
