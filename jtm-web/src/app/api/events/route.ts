// JTM Web - Events API Route
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eventCreationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    // Build where clause based on parameters
    const whereClause = includeExpired 
      ? {} 
      : {
          date: {
            gte: new Date(), // Only future events
          },
        }

    // Fetch events from database
    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc',
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

    // Format events for consumption
    const formattedEvents = events.map(event => ({
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
      foodConfig: event.foodConfig,
      currentAttendees: event._count.rsvpResponses,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }))

    return NextResponse.json({ 
      success: true,
      events: formattedEvents 
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = eventCreationSchema.parse(body)
    
    // Create event
    const event = await prisma.event.create({
      data: validatedData as any, // Temporary type assertion for Prisma compatibility
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully',
    })
    
  } catch (error) {
    console.error('Event creation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}