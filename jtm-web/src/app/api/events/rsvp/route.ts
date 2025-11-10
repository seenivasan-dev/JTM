// JTM Web - RSVP API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateRSVPConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userEmail, responses, paymentReference } = body

    if (!eventId || !userEmail || !responses) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      )
    }

    // Check if event exists and is still accepting RSVPs
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    // Check if event is full
    if (event.maxParticipants && event._count.rsvpResponses >= event.maxParticipants) {
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
          userId: user.id,
        },
      },
    })

    if (existingRSVP) {
      // Update existing RSVP
      const updatedRSVP = await prisma.rSVPResponse.update({
        where: { id: existingRSVP.id },
        data: {
          responses,
          paymentReference: paymentReference || existingRSVP.paymentReference,
        },
      })

      return NextResponse.json({
        success: true,
        rsvp: updatedRSVP,
        message: 'RSVP updated successfully',
      })
    } else {
      // Create new RSVP
      const newRSVP = await prisma.rSVPResponse.create({
        data: {
          eventId,
          userId: user.id,
          responses,
          paymentReference: paymentReference || null,
          paymentConfirmed: false,
          checkedIn: false,
        },
      })

      // Send RSVP confirmation email
      try {
        const emailTemplate = generateRSVPConfirmationEmail({
          firstName: user.firstName,
          eventTitle: event.title,
          eventDate: event.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          eventLocation: event.location,
          paymentReference: paymentReference || 'N/A',
        })

        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['rsvp', 'confirmation', event.id],
        })

        console.log(`✅ RSVP confirmation email sent to ${user.email} for event: ${event.title}`)
      } catch (emailError) {
        // Don't fail the RSVP if email fails
        console.error(`❌ Failed to send RSVP confirmation email to ${user.email}:`, emailError)
      }

      return NextResponse.json({
        success: true,
        rsvp: newRSVP,
        message: 'RSVP submitted successfully',
      })
    }
  } catch (error) {
    console.error('RSVP submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const userEmail = searchParams.get('userEmail')

    if (!eventId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId or userEmail' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's RSVP for this event
    const rsvp = await prisma.rSVPResponse.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      rsvp: rsvp || null,
    })
  } catch (error) {
    console.error('Error fetching RSVP:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}