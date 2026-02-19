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

    const { qrData, eventId } = await request.json()

    if (!qrData || !eventId) {
      return NextResponse.json({ error: 'QR data and event ID required' }, { status: 400 })
    }

    console.log('Verifying QR code for eventId:', eventId)
    console.log('QR data length:', qrData.length)

    // Decrypt and parse QR code
    let parsedData
    try {
      parsedData = parseQRCodeData(qrData)
      console.log('Parsed QR data:', parsedData)
      
      if (!parsedData) {
        return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 })
      }
    } catch (error) {
      console.error('QR parse error:', error)
      return NextResponse.json({ error: 'Invalid or corrupted QR code' }, { status: 400 })
    }

    // Verify the QR code belongs to this event
    console.log('Comparing eventIds - QR:', parsedData.eventId, 'Scanner:', eventId)
    if (parsedData.eventId !== eventId) {
      return NextResponse.json({ 
        error: `QR code is for a different event. QR event: ${parsedData.eventId}, Scanner event: ${eventId}` 
      }, { status: 400 })
    }

    // Find the attendee by encrypted QR data
    const attendee = await prisma.qRAttendee.findUnique({
      where: {
        qrCodeData: qrData
      },
      include: {
        event: true,
        checkIn: {
          include: {
            admin: true
          }
        }
      }
    })

    if (!attendee) {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 })
    }

    // Check if already checked in
    const alreadyCheckedIn = !!attendee.checkIn

    return NextResponse.json({
      attendee: {
        id: attendee.id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        attendingAdults: attendee.attendingAdults,
        adults: attendee.adults,
        kids: attendee.kids,
        adultVegFood: attendee.adultVegFood,
        adultNonVegFood: attendee.adultNonVegFood,
        kidsFood: attendee.kidsFood,
        alreadyCheckedIn,
        checkedInAt: attendee.checkIn?.checkedInAt,
        checkedInBy: attendee.checkIn?.admin?.name || attendee.checkIn?.admin?.email
      }
    })

  } catch (error) {
    console.error('Verify QR error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify QR code' },
      { status: 500 }
    )
  }
}
