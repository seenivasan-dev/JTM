import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    // Get all QR codes for the event
    const qrCodes = await prisma.rSVPQRCode.findMany({
      where: {
        rsvpResponse: {
          eventId: eventId
        }
      },
      include: {
        rsvpResponse: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const formattedQRCodes = qrCodes.map(qr => ({
      id: qr.id,
      userName: `${qr.rsvpResponse.user.firstName} ${qr.rsvpResponse.user.lastName}`,
      userEmail: qr.rsvpResponse.user.email,
      emailStatus: qr.emailStatus,
      emailSentAt: qr.emailSentAt,
      emailRetryCount: qr.emailRetryCount,
      errorMessage: qr.errorMessage
    }))

    return NextResponse.json({ qrCodes: formattedQRCodes })

  } catch (error) {
    console.error('List QR codes error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list QR codes' },
      { status: 500 }
    )
  }
}
