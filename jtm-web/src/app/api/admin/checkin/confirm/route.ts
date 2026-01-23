import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    const { qrCodeId, eventId, foodTokenGiven, notes } = body

    if (!qrCodeId || !eventId) {
      return NextResponse.json({ error: 'QR code ID and event ID required' }, { status: 400 })
    }

    // Check if already checked in
    const existingCheckIn = await prisma.eventCheckIn.findUnique({
      where: { qrCodeId: qrCodeId }
    })

    if (existingCheckIn) {
      // Update existing check-in
      const updated = await prisma.eventCheckIn.update({
        where: { qrCodeId: qrCodeId },
        data: {
          foodTokenGiven: foodTokenGiven ?? existingCheckIn.foodTokenGiven,
          notes: notes ?? existingCheckIn.notes
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Check-in updated',
        checkIn: updated
      })
    }

    // Create new check-in record
    const checkIn = await prisma.eventCheckIn.create({
      data: {
        qrCodeId: qrCodeId,
        eventId: eventId,
        checkedInBy: admin.id,
        foodTokenGiven: foodTokenGiven ?? false,
        notes: notes
      }
    })

    // Also update legacy checkedIn field on RSVP response
    const qrCode = await prisma.rSVPQRCode.findUnique({
      where: { id: qrCodeId },
      select: { rsvpResponseId: true }
    })

    if (qrCode) {
      await prisma.rSVPResponse.update({
        where: { id: qrCode.rsvpResponseId },
        data: { checkedIn: true }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in successful',
      checkIn
    })

  } catch (error) {
    console.error('Confirm check-in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm check-in' },
      { status: 500 }
    )
  }
}
