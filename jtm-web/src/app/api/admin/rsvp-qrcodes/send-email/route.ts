import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendQRCodeEmail } from '@/lib/email-qr'

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
    const { qrCodeId, eventId } = body

    if (qrCodeId) {
      // Send single QR code email
      const result = await sendQRCodeEmail(qrCodeId)
      return NextResponse.json(result)
    } else if (eventId) {
      // Send all pending emails for an event
      const qrCodes = await prisma.rSVPQRCode.findMany({
        where: {
          rsvpResponse: {
            eventId: eventId
          },
          emailStatus: {
            in: ['PENDING', 'FAILED', 'RETRY_SCHEDULED']
          }
        }
      })

      const results = {
        total: qrCodes.length,
        sent: 0,
        failed: 0,
        errors: [] as string[]
      }

      for (const qrCode of qrCodes) {
        try {
          const result = await sendQRCodeEmail(qrCode.id)
          if (result.success) {
            results.sent++
          } else {
            results.failed++
            results.errors.push(`${qrCode.id}: ${result.error}`)
          }
        } catch (error) {
          results.failed++
          results.errors.push(`${qrCode.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return NextResponse.json(results)
    } else {
      return NextResponse.json({ error: 'Either qrCodeId or eventId required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
