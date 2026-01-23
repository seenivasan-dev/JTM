import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { rsvpResponseId, eventId, foodTokenGiven, notes } = body

    if (!rsvpResponseId || !eventId) {
      return NextResponse.json({ error: 'RSVP response ID and event ID required' }, { status: 400 })
    }

    // Verify RSVP exists and matches the event
    const existingRSVP = await prisma.rSVPResponse.findUnique({
      where: { id: rsvpResponseId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      }
    })

    if (!existingRSVP) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })
    }

    if (existingRSVP.eventId !== eventId) {
      return NextResponse.json({ error: 'RSVP does not match event' }, { status: 400 })
    }

    // Update the RSVP with check-in information
    const updated = await prisma.rSVPResponse.update({
      where: { id: rsvpResponseId },
      data: {
        checkedIn: true,
        checkedInAt: existingRSVP.checkedIn ? existingRSVP.checkedInAt : new Date(),
        // Store additional check-in metadata in responses JSON
        responses: {
          ...(typeof existingRSVP.responses === 'object' && existingRSVP.responses !== null ? existingRSVP.responses : {}),
          foodTokenGiven: foodTokenGiven ?? false,
          checkInNotes: notes,
          checkedInBy: admin.id
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: existingRSVP.checkedIn ? 'Check-in updated' : 'Check-in successful',
      checkIn: updated
    })

  } catch (error) {
    console.error('Confirm check-in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm check-in' },
      { status: 500 }
    )
  }
}
