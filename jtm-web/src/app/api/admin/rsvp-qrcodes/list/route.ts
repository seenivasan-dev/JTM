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

    // Check admin privileges
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Get all RSVPs for the event
    const rsvps = await prisma.rSVPResponse.findMany({
      where: {
        eventId: eventId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const formattedQRCodes = rsvps.map(rsvp => {
      const responses = rsvp.responses as any
      return {
        id: rsvp.id,
        userName: `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        userEmail: rsvp.user.email,
        emailStatus: responses?.emailStatus || 'PENDING',
        emailSentAt: responses?.emailSentAt,
        emailRetryCount: responses?.emailRetryCount || 0,
        errorMessage: responses?.errorMessage
      }
    })

    return NextResponse.json({ qrCodes: formattedQRCodes })

  } catch (error) {
    console.error('List QR codes error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list QR codes' },
      { status: 500 }
    )
  }
}
