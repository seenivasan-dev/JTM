// JTM Web - Admin RSVP Management API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, generateRSVPApprovedEmail, generateRSVPConfirmedNoQREmail, generateRSVPRejectedEmail } from '@/lib/email'
import { generateQRCodeDataURL, generateEventQRCodeData } from '@/lib/qrcode'

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
            qrCheckinEnabled: true,
            paymentRequired: true,
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
      const eventDateStr = rsvp.event.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      if (rsvp.event.qrCheckinEnabled) {
        // Generate QR code data
        const qrCodeData = generateEventQRCodeData(rsvp.eventId, rsvp.userId)

        // Generate QR code image as data URL
        let qrCodeImageURL: string | undefined
        try {
          qrCodeImageURL = await generateQRCodeDataURL(qrCodeData, {
            width: 300,
            margin: 2,
            color: {
              dark: '#10b981',
              light: '#FFFFFF',
            },
          })
          console.log(`✅ QR code image generated for ${rsvp.user.email}`)
        } catch (qrError) {
          console.error('❌ Failed to generate QR code image:', qrError)
        }

        updatedRSVP = await prisma.rSVPResponse.update({
          where: { id: rsvpId },
          data: {
            paymentConfirmed: true,
            qrCode: qrCodeData,
          },
        })

        try {
          const emailTemplate = generateRSVPApprovedEmail({
            firstName: rsvp.user.firstName,
            eventTitle: rsvp.event.title,
            eventDate: eventDateStr,
            eventLocation: rsvp.event.location,
            qrCodeData,
            qrCodeUrl: qrCodeImageURL,
          })

          const base64QR = qrCodeImageURL?.split(',')[1]

          await sendEmail({
            to: rsvp.user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            tags: ['rsvp', 'approved', 'qr-code', rsvp.eventId],
            attachments: base64QR ? [{
              filename: 'qrcode.png',
              content: base64QR,
              encoding: 'base64',
              cid: 'qrcode',
            }] : [],
          })

          console.log(`✅ RSVP approval email with QR code sent to ${rsvp.user.email} for event: ${rsvp.event.title}`)
        } catch (emailError) {
          console.error(`❌ Failed to send RSVP approval email to ${rsvp.user.email}:`, emailError)
        }

        return NextResponse.json({
          success: true,
          rsvp: updatedRSVP,
          message: 'Payment approved and QR code generated',
          qrCodeData,
        })
      } else {
        // No QR check-in — just confirm and send confirmation email (no QR)
        updatedRSVP = await prisma.rSVPResponse.update({
          where: { id: rsvpId },
          data: {
            paymentConfirmed: true,
          },
        })

        try {
          const emailTemplate = generateRSVPConfirmedNoQREmail({
            firstName: rsvp.user.firstName,
            eventTitle: rsvp.event.title,
            eventDate: eventDateStr,
            eventLocation: rsvp.event.location,
          })

          await sendEmail({
            to: rsvp.user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            tags: ['rsvp', 'confirmed', rsvp.eventId],
          })

          console.log(`✅ RSVP confirmation email sent to ${rsvp.user.email} for event: ${rsvp.event.title}`)
        } catch (emailError) {
          console.error(`❌ Failed to send RSVP confirmation email to ${rsvp.user.email}:`, emailError)
        }

        return NextResponse.json({
          success: true,
          rsvp: updatedRSVP,
          message: 'RSVP confirmed',
        })
      }
    } else if (action === 'reject_payment') {
      updatedRSVP = await prisma.rSVPResponse.update({
        where: { id: rsvpId },
        data: {
          paymentConfirmed: false,
          qrCode: null,
        },
      })

      try {
        const emailTemplate = generateRSVPRejectedEmail({
          firstName: rsvp.user.firstName,
          eventTitle: rsvp.event.title,
          eventDate: rsvp.event.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          eventLocation: rsvp.event.location,
        })

        await sendEmail({
          to: rsvp.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['rsvp', 'rejected', rsvp.eventId],
        })

        console.log(`✅ RSVP rejection email sent to ${rsvp.user.email} for event: ${rsvp.event.title}`)
      } catch (emailError) {
        console.error(`❌ Failed to send RSVP rejection email to ${rsvp.user.email}:`, emailError)
      }

      return NextResponse.json({
        success: true,
        rsvp: updatedRSVP,
        message: 'RSVP rejected',
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rsvpId = searchParams.get('rsvpId')

    if (!rsvpId) {
      return NextResponse.json({ success: false, error: 'rsvpId is required' }, { status: 400 })
    }

    await prisma.rSVPResponse.delete({ where: { id: rsvpId } })

    return NextResponse.json({ success: true, message: 'RSVP deleted successfully' })
  } catch (error) {
    console.error('Delete RSVP error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}