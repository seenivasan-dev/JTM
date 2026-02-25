import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

const MAX_RETRY_COUNT = 3
const EMAIL_DELAY_MS = 2000 // 2 seconds delay between emails

function createTransporter() {
  // Create a fresh transporter each time — pool/rateLimit settings are
  // meaningless in serverless (each invocation is a new process).
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })
}

async function sendSingleEmail(attendeeId: string, forceRetry = false) {
  const attendee = await prisma.qRAttendee.findUnique({
    where: { id: attendeeId },
    include: {
      event: true
    }
  })

  if (!attendee) {
    return { success: false, error: 'Attendee not found' }
  }

  console.log('Sending email to:', attendee.email)
  console.log('QR Code Image URL exists:', !!attendee.qrCodeImageUrl)
  console.log('QR Code Image URL length:', attendee.qrCodeImageUrl?.length)
  console.log('QR Code starts with:', attendee.qrCodeImageUrl?.substring(0, 50))

  if (!attendee.qrCodeImageUrl) {
    return { success: false, error: 'QR code image not found for attendee' }
  }

  if (attendee.emailRetryCount >= MAX_RETRY_COUNT) {
    if (!forceRetry) {
      await prisma.qRAttendee.update({
        where: { id: attendeeId },
        data: {
          emailStatus: 'FAILED',
          errorMessage: 'Max retry count exceeded. Use the individual Resend button to force retry.'
        }
      })
      return { success: false, error: 'Max retry count exceeded' }
    }
    // forceRetry: reset the counter so the send proceeds
    await prisma.qRAttendee.update({
      where: { id: attendeeId },
      data: { emailRetryCount: 0, errorMessage: null }
    })
  }

  const totalCoupons = (attendee.adultVegFood || 0) + (attendee.adultNonVegFood || 0) + (attendee.kidsFood || 0)
  const totalAttendees = (attendee.attendingAdults || 0) + (attendee.kidsFood || 0)
  const eventOnly = totalCoupons === 0

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0891b2 0%, #2563eb 60%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; }
          .qr-wrapper { display: inline-block; background-color: #ffffff; padding: 16px; border-radius: 10px; border: 2px solid #3b82f6; }
          .qr-image { display: block; max-width: 280px; background-color: #ffffff; filter: none; }
          .coupons { background: #fef3c7; border: 3px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
          .coupons-number { font-size: 48px; font-weight: bold; color: #f59e0b; }
          .event-only { background: #f0fdf4; border: 3px solid #16a34a; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
          .event-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .detail-row { margin: 10px 0; padding: 10px; border-left: 3px solid #3b82f6; background: #f3f4f6; }
          @media (prefers-color-scheme: dark) {
            .qr-wrapper { background-color: #ffffff !important; }
            .qr-image { background-color: #ffffff !important; filter: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Event QR Code</h1>
            <p>Jacksonville Tamil Mandram</p>
          </div>
          <div class="content">
            <p>Dear ${attendee.name},</p>
            <p>You're registered for <strong>${attendee.event.title}</strong>!</p>

            <div class="event-details">
              <h2 style="color: #3b82f6; margin-top: 0;">Event Details</h2>
              <div class="detail-row"><strong>Event:</strong> ${attendee.event.title}</div>
              <div class="detail-row"><strong>Date:</strong> ${new Date(attendee.event.date).toLocaleDateString()}</div>
              ${attendee.event.time ? `<div class="detail-row"><strong>Time:</strong> ${attendee.event.time}</div>` : ''}
              <div class="detail-row"><strong>Location:</strong> ${attendee.event.location}</div>
              ${totalAttendees > 0 ? `<div class="detail-row"><strong>Total Attendees:</strong> ${totalAttendees} person${totalAttendees !== 1 ? 's' : ''}</div>` : ''}
            </div>

            ${eventOnly ? `
            <div class="event-only">
              <h3 style="color: #15803d; margin-top: 0;">🎉 Event Only</h3>
              <p style="color: #166534; font-weight: bold; margin: 5px 0;">No food coupons for this registration</p>
              ${totalAttendees > 0 ? `<p style="color: #166534; margin: 5px 0;">${totalAttendees} attendee${totalAttendees !== 1 ? 's' : ''} attending</p>` : ''}
            </div>
            ` : `
            <div class="coupons">
              <h3 style="color: #78350f; margin-top: 0;">🍽️ Food Coupons</h3>
              <div class="coupons-number">${totalCoupons}</div>
              <p style="color: #78350f; font-weight: bold; margin: 10px 0;">
                ${totalCoupons === 1 ? 'coupon will be given' : 'coupons will be given'}
              </p>
              <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                ${(attendee.adultVegFood || 0) > 0 ? `
                <div style="background: #dcfce7; padding: 8px 16px; border-radius: 8px; border: 2px solid #16a34a;">
                  <div style="font-weight: bold; color: #15803d;">🥗 ${attendee.adultVegFood}</div>
                  <div style="font-size: 12px; color: #166534;">Adult Veg</div>
                </div>
                ` : ''}
                ${(attendee.adultNonVegFood || 0) > 0 ? `
                <div style="background: #fee2e2; padding: 8px 16px; border-radius: 8px; border: 2px solid #dc2626;">
                  <div style="font-weight: bold; color: #991b1b;">🍗 ${attendee.adultNonVegFood}</div>
                  <div style="font-size: 12px; color: #7f1d1d;">Adult Non-Veg</div>
                </div>
                ` : ''}
                ${(attendee.kidsFood || 0) > 0 ? `
                <div style="background: #dbeafe; padding: 8px 16px; border-radius: 8px; border: 2px solid #2563eb;">
                  <div style="font-weight: bold; color: #1e40af;">👶 ${attendee.kidsFood}</div>
                  <div style="font-size: 12px; color: #1e3a8a;">Kids Food</div>
                </div>
                ` : ''}
              </div>
            </div>
            `}

            <div class="qr-code">
              <h3 style="color: #3b82f6;">Your Check-in QR Code</h3>
              <div class="qr-wrapper" style="display:inline-block;background-color:#ffffff;padding:16px;border-radius:10px;border:2px solid #3b82f6;">
                <img class="qr-image" src="cid:qrcode" alt="QR Code"
                  style="display:block;background-color:#ffffff;max-width:280px;filter:none;" />
              </div>
              <p style="color: #6b7280; margin-top: 20px;">
                <strong>Present this at the entrance</strong>
              </p>
            </div>

            ${attendee.dietaryRestrictions || attendee.specialRequests ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              ${attendee.dietaryRestrictions ? `<p><strong>Dietary:</strong> ${attendee.dietaryRestrictions}</p>` : ''}
              ${attendee.specialRequests ? `<p><strong>Requests:</strong> ${attendee.specialRequests}</p>` : ''}
            </div>
            ` : ''}

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <strong>Important:</strong>
              <ul style="margin: 10px 0;">
                <li>Save this email or screenshot the QR code</li>
                ${eventOnly
                  ? '<li>No food coupons — event attendance only</li>'
                  : `<li>You'll receive <strong>${totalCoupons} food ${totalCoupons === 1 ? 'coupon' : 'coupons'}</strong> upon check-in</li>`
                }
                <li>One QR code for your entire group</li>
              </ul>
            </div>

            <p>See you at the event!</p>

            <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Jacksonville Tamil Mandram<br/>This is an automated email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    // Extract base64 data from data URL
    const base64Data = attendee.qrCodeImageUrl.replace(/^data:image\/png;base64,/, '')
    
    console.log('Attempting to send email...')
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? '***configured***' : 'NOT SET',
      password: process.env.SMTP_PASSWORD ? '***configured***' : 'NOT SET'
    })
    
    const mailOptions = {
      from: `"Jacksonville Tamil Mandram" <${process.env.SMTP_USER}>`,
      to: attendee.email,
      subject: `Event QR Code - ${attendee.event.title}`,
      html: emailHtml,
      attachments: [{
        filename: 'qrcode.png',
        content: base64Data,
        encoding: 'base64',
        cid: 'qrcode'
      }]
    }
    
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })
    
    const info = await createTransporter().sendMail(mailOptions)
    
    console.log('Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Response:', info.response)

    await prisma.qRAttendee.update({
      where: { id: attendeeId },
      data: {
        emailStatus: 'SENT',
        emailSentAt: new Date(),
        errorMessage: null
      }
    })

    return { success: true, messageId: info.messageId }
  } catch (emailError) {
    const retryCount = attendee.emailRetryCount + 1
    const newStatus = retryCount >= MAX_RETRY_COUNT ? 'FAILED' : 'RETRY_SCHEDULED'

    await prisma.qRAttendee.update({
      where: { id: attendeeId },
      data: {
        emailStatus: newStatus,
        emailRetryCount: retryCount,
        lastRetryAt: new Date(),
        errorMessage: emailError instanceof Error ? emailError.message : 'Email send failed'
      }
    })

    return {
      success: false,
      error: emailError instanceof Error ? emailError.message : 'Email send failed'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin check is optional
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email || '' }
      })
    } catch (error) {
      console.warn('Admin check skipped:', error)
    }

    const body = await request.json()
    const { attendeeId, eventId, forceRetry } = body

    if (attendeeId) {
      const result = await sendSingleEmail(attendeeId, !!forceRetry)
      return NextResponse.json(result)
    } else if (eventId) {
      const attendees = await prisma.qRAttendee.findMany({
        where: {
          eventId: eventId,
          emailStatus: {
            in: ['PENDING', 'FAILED', 'RETRY_SCHEDULED']
          }
        }
      })

      console.log(`Found ${attendees.length} attendees with pending/failed email status`)

      const results = {
        total: attendees.length,
        sent: 0,
        failed: 0,
        errors: [] as string[]
      }

      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i]
        console.log(`Processing attendee ${i + 1}/${attendees.length}: ${attendee.email} (status: ${attendee.emailStatus})`)
        const result = await sendSingleEmail(attendee.id)
        if (result.success) {
          results.sent++
          console.log(`✓ Email sent successfully to ${attendee.email}`)
        } else {
          results.failed++
          results.errors.push(`${attendee.email}: ${result.error}`)
          console.log(`✗ Email failed for ${attendee.email}: ${result.error}`)
        }
        
        // Add delay between emails to prevent rate limiting
        if (i < attendees.length - 1) {
          console.log(`Waiting ${EMAIL_DELAY_MS}ms before next email...`)
          await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS))
        }
      }

      console.log(`Email batch complete: ${results.sent} sent, ${results.failed} failed`)
      return NextResponse.json(results)
    } else {
      return NextResponse.json({ error: 'Either attendeeId or eventId required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
