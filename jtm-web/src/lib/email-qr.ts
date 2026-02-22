// JTM Web - QR Code Email Service
import { prisma } from './prisma'
import nodemailer from 'nodemailer'

const MAX_RETRY_COUNT = 3
const EMAIL_DELAY_MS = 2000 // 2 seconds delay between emails

// Delay utility to prevent rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Create email transporter with connection pooling
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

interface EmailResult {
  success: boolean
  error?: string
}

/**
 * Send QR code email to RSVP recipient
 */
export async function sendQRCodeEmail(rsvpResponseId: string): Promise<EmailResult> {
  try {
    // Get RSVP response with related data
    const rsvpResponse = await prisma.rSVPResponse.findUnique({
      where: { id: rsvpResponseId },
      include: {
        user: true,
        event: true
      }
    })

    if (!rsvpResponse) {
      return { success: false, error: 'RSVP not found' }
    }

    const { user, event } = rsvpResponse
    const responses = rsvpResponse.responses as any
    const emailRetryCount = responses?.emailRetryCount || 0

    // Check retry limit
    if (emailRetryCount >= MAX_RETRY_COUNT) {
      await prisma.rSVPResponse.update({
        where: { id: rsvpResponseId },
        data: {
          responses: {
            ...responses,
            emailStatus: 'FAILED',
            errorMessage: 'Max retry count exceeded'
          }
        }
      })
      return { success: false, error: 'Max retry count exceeded' }
    }

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .qr-code {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: white;
              border-radius: 10px;
            }
            .qr-wrapper {
              display: inline-block;
              background-color: #ffffff;
              padding: 16px;
              border-radius: 10px;
            }
            .qr-image {
              display: block;
              max-width: 280px;
              background-color: #ffffff;
              filter: none;
            }
            .event-details {
              background: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .detail-row {
              margin: 10px 0;
              padding: 10px;
              border-left: 3px solid #3b82f6;
              background: #f3f4f6;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
            @media (prefers-color-scheme: dark) {
              .qr-wrapper { background-color: #ffffff !important; }
              .qr-image { background-color: #ffffff !important; filter: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Event Check-in QR Code</h1>
              <p>Jacksonville Tamil Mandram</p>
            </div>
            <div class="content">
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>Thank you for RSVPing to our event! Please use the QR code below for check-in.</p>

              <div class="event-details">
                <h2 style="color: #3b82f6; margin-top: 0;">Event Details</h2>
                <div class="detail-row">
                  <strong>Event:</strong> ${event.title}
                </div>
                <div class="detail-row">
                  <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}
                </div>
                <div class="detail-row">
                  <strong>Time:</strong> ${new Date(event.date).toLocaleTimeString()}
                </div>
                <div class="detail-row">
                  <strong>Location:</strong> ${event.location}
                </div>
              </div>

              <div class="qr-code">
                <h3 style="color: #3b82f6;">Your Check-in QR Code</h3>
                <div class="qr-wrapper" style="display:inline-block;background-color:#ffffff;padding:16px;border-radius:10px;border:2px solid #3b82f6;">
                  <img class="qr-image" src="${rsvpResponse.qrCode}" alt="QR Code"
                    style="display:block;background-color:#ffffff;max-width:280px;filter:none;" />
                </div>
                <p style="color: #6b7280; margin-top: 20px;">
                  <strong>Please present this QR code at the event entrance</strong>
                </p>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>Important:</strong>
                <ul style="margin: 10px 0;">
                  <li>Save this email or take a screenshot of the QR code</li>
                  <li>Bring the QR code to the event for quick check-in</li>
                  <li>If you have guests, they will need to check in with you</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">We look forward to seeing you at the event!</p>

              <div class="footer">
                <p>Jacksonville Tamil Mandram<br/>
                This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      // Send email
      await transporter.sendMail({
        from: `"Japan Tamil Manjapai" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Event Check-in QR Code - ${event.title}`,
        html: emailHtml
      })

      // Update email status
      await prisma.rSVPResponse.update({
        where: { id: rsvpResponseId },
        data: {
          responses: {
            ...responses,
            emailStatus: 'SENT',
            emailSentAt: new Date(),
            errorMessage: null
          }
        }
      })

      return { success: true }

    } catch (emailError) {
      // Update retry count and status
      const retryCount = emailRetryCount + 1
      const newStatus = retryCount >= MAX_RETRY_COUNT ? 'FAILED' : 'RETRY_SCHEDULED'

      await prisma.rSVPResponse.update({
        where: { id: rsvpResponseId },
        data: {
          responses: {
            ...responses,
            emailStatus: newStatus,
            emailRetryCount: retryCount,
            lastRetryAt: new Date(),
            errorMessage: emailError instanceof Error ? emailError.message : 'Email send failed'
          }
        }
      })

      return {
        success: false,
        error: emailError instanceof Error ? emailError.message : 'Email send failed'
      }
    }

  } catch (error) {
    console.error('QR code email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Retry failed emails
 */
export async function retryFailedEmails(eventId: string): Promise<{
  total: number
  sent: number
  failed: number
  errors: string[]
}> {
  const results = {
    total: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  try {
    // Get all RSVPs for the event that need email retry
    const rsvps = await prisma.rSVPResponse.findMany({
      where: {
        eventId: eventId
      }
    })

    // Filter based on email status in responses JSON
    const needsRetry = rsvps.filter(rsvp => {
      const responses = rsvp.responses as any
      const emailStatus = responses?.emailStatus
      const emailRetryCount = responses?.emailRetryCount || 0
      return (
        (!emailStatus || emailStatus === 'FAILED' || emailStatus === 'RETRY_SCHEDULED') &&
        emailRetryCount < MAX_RETRY_COUNT
      )
    })

    results.total = needsRetry.length

    for (const rsvp of needsRetry) {
      const result = await sendQRCodeEmail(rsvp.id)
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        results.errors.push(`${rsvp.id}: ${result.error}`)
      }
      
      // Add delay between emails to prevent rate limiting
      if (results.sent + results.failed < needsRetry.length) {
        await delay(EMAIL_DELAY_MS)
      }
    }

    return results

  } catch (error) {
    console.error('Retry emails error:', error)
    return results
  }
}
