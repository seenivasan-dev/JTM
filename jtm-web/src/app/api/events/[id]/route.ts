// JTM Web - Individual Event API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvpResponses: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            rsvpResponses: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Format event data
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      flyer: event.flyer,
      date: event.date,
      location: event.location,
      rsvpRequired: event.rsvpRequired,
      rsvpDeadline: event.rsvpDeadline,
      maxParticipants: event.maxParticipants,
      rsvpForm: event.rsvpForm,
      currentAttendees: event._count.rsvpResponses,
      rsvpResponses: event.rsvpResponses.map(response => ({
        id: response.id,
        responses: response.responses,
        paymentConfirmed: response.paymentConfirmed,
        qrCode: response.qrCode,
        checkedIn: response.checkedIn,
        user: response.user,
        createdAt: response.createdAt,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }

    return NextResponse.json({
      success: true,
      event: formattedEvent,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        location: body.location,
        rsvpRequired: body.rsvpRequired,
        rsvpDeadline: body.rsvpDeadline ? new Date(body.rsvpDeadline) : null,
        maxParticipants: body.maxParticipants,
        flyer: body.flyer,
        rsvpForm: body.rsvpForm,
      },
    })

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: 'Event updated successfully',
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } }
) {
  try {
    const { id: eventId } = await params

    await prisma.event.delete({
      where: { id: eventId },
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}