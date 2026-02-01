import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

const MAX_RETRY_COUNT = 3
const EMAIL_DELAY_MS = 2000 // 2 seconds delay between emails

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  pool: true, // Use connection pooling
  maxConnections: 1, // Limit to 1 connection to avoid rate limits
  maxMessages: 100, // Allow up to 100 messages per connection
  rateDelta: 1000, // 1 second between messages
  rateLimit: 1, // 1 message per rateDelta
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

async function sendSingleEmail(attendeeId: string) {
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
    await prisma.qRAttendee.update({
      where: { id: attendeeId },
      data: {
        emailStatus: 'FAILED',
        errorMessage: 'Max retry count exceeded'
      }
    })
    return { success: false, error: 'Max retry count exceeded' }
  }

  const totalCoupons = (attendee.adults || 1) + (attendee.kids || 0)

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; }
          .qr-code img { max-width: 300px; border: 2px solid #3b82f6; border-radius: 10px; padding: 10px; }
          .coupons { background: #fef3c7; border: 3px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
          .coupons-number { font-size: 48px; font-weight: bold; color: #f59e0b; }
          .event-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .detail-row { margin: 10px 0; padding: 10px; border-left: 3px solid #3b82f6; background: #f3f4f6; }
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
            </div>

            <div class="coupons">
              <h3 style="color: #78350f; margin-top: 0;">🍽️ Food Coupons</h3>
              <div class="coupons-number">${totalCoupons}</div>
              <p style="color: #78350f; font-weight: bold; margin: 10px 0;">
                ${totalCoupons === 1 ? 'coupon will be given' : 'coupons will be given'}
              </p>
              <p style="color: #78350f; font-size: 14px;">
                (${attendee.adults || 1} Adult${(attendee.adults || 1) !== 1 ? 's' : ''}${(attendee.kids || 0) > 0 ? ` + ${attendee.kids} Kid${attendee.kids !== 1 ? 's' : ''}` : ''})
              </p>
            </div>

            <div class="qr-code">
              <h3 style="color: #3b82f6;">Your Check-in QR Code</h3>
              <img src="cid:qrcode" alt="QR Code" style="max-width: 300px; border: 2px solid #3b82f6; border-radius: 10px; padding: 10px;" />
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
                <li>You'll receive <strong>${totalCoupons} food ${totalCoupons === 1 ? 'coupon' : 'coupons'}</strong> upon check-in</li>
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
    
    const info = await transporter.sendMail(mailOptions)
    
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
    const { attendeeId, eventId } = body

    if (attendeeId) {
      const result = await sendSingleEmail(attendeeId)
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
