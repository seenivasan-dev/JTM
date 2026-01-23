import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
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

    // Find QR code record
    const qrCode = await prisma.rSVPQRCode.findFirst({
      where: {
        qrCodeData: qrData
      },
      include: {
        rsvpResponse: {
          include: {
            user: true,
            event: true
          }
        },
        checkIn: true
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found in system' }, { status: 404 })
    }

    // Verify event matches
    if (qrCode.rsvpResponse.eventId !== parsed.eventId) {
      return NextResponse.json({ error: 'QR code event mismatch' }, { status: 400 })
    }

    // Return RSVP details
    return NextResponse.json({
      success: true,
      qrCodeId: qrCode.id,
      alreadyCheckedIn: !!qrCode.checkIn,
      checkInDetails: qrCode.checkIn ? {
        checkedInAt: qrCode.checkIn.checkedInAt,
        foodTokenGiven: qrCode.checkIn.foodTokenGiven
      } : null,
      rsvp: {
        id: qrCode.rsvpResponse.id,
        userName: `${qrCode.rsvpResponse.user.firstName} ${qrCode.rsvpResponse.user.lastName}`,
        userEmail: qrCode.rsvpResponse.user.email,
        userPhone: qrCode.rsvpResponse.user.mobileNumber,
        eventTitle: qrCode.rsvpResponse.event.title,
        eventDate: qrCode.rsvpResponse.event.date,
        eventTime: (qrCode.rsvpResponse.event as any).time || 'TBD',
        eventLocation: qrCode.rsvpResponse.event.location,
        numberOfGuests: (qrCode.rsvpResponse.responses as any)?.numberOfGuests || 0,
        dietaryRestrictions: (qrCode.rsvpResponse.responses as any)?.dietaryRestrictions,
        specialRequests: (qrCode.rsvpResponse.responses as any)?.specialRequests,
        responseStatus: (qrCode.rsvpResponse.responses as any)?.responseStatus || 'ATTENDING'
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
