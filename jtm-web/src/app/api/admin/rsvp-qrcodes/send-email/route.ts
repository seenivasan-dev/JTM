import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
    const { rsvpResponseId, eventId } = body

    if (rsvpResponseId) {
      // Send single QR code email
      const result = await sendQRCodeEmail(rsvpResponseId)
      return NextResponse.json(result)
    } else if (eventId) {
      // Send all pending emails for an event
      const rsvps = await prisma.rSVPResponse.findMany({
        where: {
          eventId: eventId
        }
      })

      // Filter based on email status in responses JSON
      const needsEmail = rsvps.filter(rsvp => {
        const responses = rsvp.responses as any
        const emailStatus = responses?.emailStatus
        return !emailStatus || emailStatus === 'PENDING' || emailStatus === 'FAILED' || emailStatus === 'RETRY_SCHEDULED'
      })

      const results = {
        total: needsEmail.length,
        sent: 0,
        failed: 0,
        errors: [] as string[]
      }

      console.log(`Starting bulk email send: ${needsEmail.length} emails to send`)

      for (let i = 0; i < needsEmail.length; i++) {
        const rsvp = needsEmail[i]
        console.log(`Processing email ${i + 1}/${needsEmail.length}...`)
        try {
          const result = await sendQRCodeEmail(rsvp.id)
          if (result.success) {
            results.sent++
            console.log(`✓ Email ${i + 1}/${needsEmail.length} sent successfully`)
          } else {
            results.failed++
            results.errors.push(`${rsvp.id}: ${result.error}`)
            console.log(`✗ Email ${i + 1}/${needsEmail.length} failed: ${result.error}`)
          }
        } catch (error) {
          results.failed++
          results.errors.push(`${rsvp.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          console.log(`✗ Email ${i + 1}/${needsEmail.length} error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        
        // Add 2 second delay between emails to prevent rate limiting
        if (i < needsEmail.length - 1) {
          console.log('Waiting 2s before next email...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log(`Bulk email complete: ${results.sent} sent, ${results.failed} failed`)
      return NextResponse.json(results)
    } else {
      return NextResponse.json({ error: 'Either rsvpResponseId or eventId required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
