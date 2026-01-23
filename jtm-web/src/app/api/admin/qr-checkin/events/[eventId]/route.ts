import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    const event = await prisma.checkInEvent.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        location: event.location
      }
    })
  } catch (error) {
    console.error('Error fetching event info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event information' },
      { status: 500 }
    )
  }
}
