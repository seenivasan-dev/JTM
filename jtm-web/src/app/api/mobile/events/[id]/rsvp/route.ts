// JTM Mobile - RSVP API
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Submit or update RSVP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    const { userId, response, paymentReference } = body

    console.log('📱 [Mobile RSVP API] POST request:', { eventId, userId, response })

    if (!userId || !response) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or response' },
        { status: 400 }
      )
    }

    // Validate response
    if (!['Yes', 'No', 'Maybe'].includes(response)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response. Must be Yes, No, or Maybe' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      )
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { rsvpResponses: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if RSVP deadline has passed
    if (event.rsvpDeadline && new Date() > event.rsvpDeadline) {
      return NextResponse.json(
        { success: false, error: 'RSVP deadline has passed' },
        { status: 400 }
      )
    }

    // Check if event is full (only for "Yes" responses)
    if (response === 'Yes' && event.maxParticipants && event._count.rsvpResponses >= event.maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'Event is full' },
        { status: 400 }
      )
    }

    // Check if user has already RSVPed
    const existingRSVP = await prisma.rSVPResponse.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    })

    let rsvpRecord

    if (existingRSVP) {
      // Update existing RSVP
      rsvpRecord = await prisma.rSVPResponse.update({
        where: { id: existingRSVP.id },
        data: {
          responses: { status: response }, // Simple status for mobile
          paymentReference: paymentReference || existingRSVP.paymentReference,
          updatedAt: new Date(),
        },
      })

      console.log('✅ [Mobile RSVP API] Updated existing RSVP:', rsvpRecord.id)
    } else {
      // Create new RSVP
      rsvpRecord = await prisma.rSVPResponse.create({
        data: {
          eventId,
          userId,
          responses: { status: response }, // Simple status for mobile
          paymentReference: paymentReference || null,
          paymentConfirmed: false,
          checkedIn: false,
        },
      })

      console.log('✅ [Mobile RSVP API] Created new RSVP:', rsvpRecord.id)
    }

    return NextResponse.json({
      success: true,
      rsvp: {
        id: rsvpRecord.id,
        response,
        paymentConfirmed: rsvpRecord.paymentConfirmed,
        checkedIn: rsvpRecord.checkedIn,
        paymentReference: rsvpRecord.paymentReference,
      },
      message: existingRSVP ? 'RSVP updated successfully' : 'RSVP submitted successfully',
    })
  } catch (error) {
    console.error('❌ [Mobile RSVP API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Check user's RSVP status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('📱 [Mobile RSVP API] GET request:', { eventId, userId })

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Find the RSVP
    const rsvp = await prisma.rSVPResponse.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            date: true,
            location: true,
          },
        },
      },
    })

    if (!rsvp) {
      return NextResponse.json({
        hasRsvp: false,
        response: null,
        paymentConfirmed: false,
        qrCode: null,
      })
    }

    // Generate QR code data if payment is confirmed
    let qrCodeData = null
    if (rsvp.paymentConfirmed) {
      qrCodeData = {
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        userEmail: rsvp.user.email,
        userName: `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        eventTitle: rsvp.event.title,
        eventDate: rsvp.event.date,
        rsvpId: rsvp.id,
        timestamp: new Date().toISOString(),
      }
    }

    const status = (rsvp.responses as any)?.status || 'Unknown'

    return NextResponse.json({
      hasRsvp: true,
      response: status,
      paymentConfirmed: rsvp.paymentConfirmed,
      paymentReference: rsvp.paymentReference,
      checkedIn: rsvp.checkedIn,
      qrCode: qrCodeData,
      rsvpId: rsvp.id,
    })
  } catch (error) {
    console.error('❌ [Mobile RSVP API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
