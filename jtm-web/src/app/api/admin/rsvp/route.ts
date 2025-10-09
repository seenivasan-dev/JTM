// JTM Web - Admin RSVP Management API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rsvpId, action, paymentConfirmed } = body

    if (!rsvpId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the RSVP response
    const rsvp = await prisma.rSVPResponse.findUnique({
      where: { id: rsvpId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        event: {
          select: {
            title: true,
            date: true,
            location: true,
          }
        }
      }
    })

    if (!rsvp) {
      return NextResponse.json(
        { success: false, error: 'RSVP not found' },
        { status: 404 }
      )
    }

    let updatedRSVP

    if (action === 'approve_payment') {
      // Generate QR code data
      const qrCodeData = `JTM-EVENT:${rsvp.eventId}:${rsvp.userId}:${Date.now()}`
      
      updatedRSVP = await prisma.rSVPResponse.update({
        where: { id: rsvpId },
        data: {
          paymentConfirmed: true,
          qrCode: qrCodeData,
        },
      })

      // Here you would typically send an email to the user with the QR code
      // For now, we'll just return the QR code data
      
      return NextResponse.json({
        success: true,
        rsvp: updatedRSVP,
        message: 'Payment approved and QR code generated',
        qrCodeData,
      })
    } else if (action === 'reject_payment') {
      updatedRSVP = await prisma.rSVPResponse.update({
        where: { id: rsvpId },
        data: {
          paymentConfirmed: false,
          qrCode: null,
        },
      })

      return NextResponse.json({
        success: true,
        rsvp: updatedRSVP,
        message: 'Payment rejected',
      })
    } else if (action === 'checkin') {
      updatedRSVP = await prisma.rSVPResponse.update({
        where: { id: rsvpId },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        rsvp: updatedRSVP,
        message: 'User checked in successfully',
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Admin RSVP management error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID required' },
        { status: 400 }
      )
    }

    // Get all RSVP responses for the event
    const rsvps = await prisma.rSVPResponse.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Serialize the data
    const serializedRSVPs = rsvps.map(rsvp => ({
      id: rsvp.id,
      responses: rsvp.responses,
      paymentReference: rsvp.paymentReference,
      paymentConfirmed: rsvp.paymentConfirmed,
      qrCode: rsvp.qrCode,
      checkedIn: rsvp.checkedIn,
      checkedInAt: rsvp.checkedInAt?.toISOString() || null,
      createdAt: rsvp.createdAt.toISOString(),
      updatedAt: rsvp.updatedAt.toISOString(),
      user: rsvp.user,
    }))

    return NextResponse.json({
      success: true,
      rsvps: serializedRSVPs,
    })
  } catch (error) {
    console.error('Get RSVP responses error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}