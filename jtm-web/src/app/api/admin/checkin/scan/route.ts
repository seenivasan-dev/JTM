import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseQRCodeData } from '@/lib/qrcode'

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
    const { qrData } = body

    if (!qrData) {
      return NextResponse.json({ error: 'QR data required' }, { status: 400 })
    }

    // Parse and decrypt QR code
    const parsed = parseQRCodeData(qrData)

    if (!parsed) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 })
    }

    // Find RSVP record by QR code data
    const rsvpResponse = await prisma.rSVPResponse.findFirst({
      where: {
        qrCode: qrData,
        eventId: parsed.eventId
      },
      include: {
        user: true,
        event: true
      }
    })

    if (!rsvpResponse) {
      return NextResponse.json({ error: 'QR code not found in system' }, { status: 404 })
    }

    const responses = rsvpResponse.responses as any

    // Return RSVP details
    return NextResponse.json({
      success: true,
      rsvpResponseId: rsvpResponse.id,
      alreadyCheckedIn: rsvpResponse.checkedIn,
      checkInDetails: rsvpResponse.checkedIn ? {
        checkedInAt: rsvpResponse.checkedInAt,
        foodTokenGiven: responses?.foodTokenGiven || false
      } : null,
      rsvp: {
        id: rsvpResponse.id,
        userName: `${rsvpResponse.user.firstName} ${rsvpResponse.user.lastName}`,
        userEmail: rsvpResponse.user.email,
        userPhone: rsvpResponse.user.mobileNumber,
        eventTitle: rsvpResponse.event.title,
        eventDate: rsvpResponse.event.date,
        eventTime: (rsvpResponse.event as any).time || 'TBD',
        eventLocation: rsvpResponse.event.location,
        numberOfGuests: responses?.numberOfGuests || 0,
        dietaryRestrictions: responses?.dietaryRestrictions,
        specialRequests: responses?.specialRequests,
        responseStatus: responses?.responseStatus || 'ATTENDING'
      }
    })

  } catch (error) {
    console.error('Scan QR error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scan QR code' },
      { status: 500 }
    )
  }
}
