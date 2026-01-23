// JTM Web - QR Code Email Service
import prisma from './prisma'
import nodemailer from 'nodemailer'

const MAX_RETRY_COUNT = 3

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
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
export async function sendQRCodeEmail(qrCodeId: string): Promise<EmailResult> {
  try {
    // Get QR code with related data
    const qrCode = await prisma.rSVPQRCode.findUnique({
      where: { id: qrCodeId },
      include: {
        rsvpResponse: {
          include: {
            user: true,
            event: true
          }
        }
      }
    })

    if (!qrCode) {
      return { success: false, error: 'QR code not found' }
    }

    const { rsvpResponse } = qrCode
    const { user, event } = rsvpResponse

    // Check retry limit
    if (qrCode.emailRetryCount >= MAX_RETRY_COUNT) {
      await prisma.rSVPQRCode.update({
        where: { id: qrCodeId },
        data: {
          emailStatus: 'FAILED',
          errorMessage: 'Max retry count exceeded'
        }
      })
      return { success: false, error: 'Max retry count exceeded' }
    }

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
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
            .qr-code img {
              max-width: 300px;
              border: 2px solid #3b82f6;
              border-radius: 10px;
              padding: 10px;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Event Check-in QR Code</h1>
              <p>Japan Tamil Manjapai</p>
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
                  <strong>Time:</strong> ${event.time}
                </div>
                <div class="detail-row">
                  <strong>Location:</strong> ${event.location}
                </div>
              </div>

              <div class="qr-code">
                <h3 style="color: #3b82f6;">Your Check-in QR Code</h3>
                <img src="${qrCode.qrCodeImageUrl}" alt="QR Code" />
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
                <p>Japan Tamil Manjapai<br/>
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
      await prisma.rSVPQRCode.update({
        where: { id: qrCodeId },
        data: {
          emailStatus: 'SENT',
          emailSentAt: new Date(),
          errorMessage: null
        }
      })

      return { success: true }

    } catch (emailError) {
      // Update retry count and status
      const retryCount = qrCode.emailRetryCount + 1
      const newStatus = retryCount >= MAX_RETRY_COUNT ? 'FAILED' : 'RETRY_SCHEDULED'

      await prisma.rSVPQRCode.update({
        where: { id: qrCodeId },
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
    // Get all failed or retry scheduled QR codes for the event
    const qrCodes = await prisma.rSVPQRCode.findMany({
      where: {
        rsvpResponse: {
          eventId: eventId
        },
        emailStatus: {
          in: ['FAILED', 'RETRY_SCHEDULED']
        },
        emailRetryCount: {
          lt: MAX_RETRY_COUNT
        }
      }
    })

    results.total = qrCodes.length

    for (const qrCode of qrCodes) {
      const result = await sendQRCodeEmail(qrCode.id)
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        results.errors.push(`${qrCode.id}: ${result.error}`)
      }
    }

    return results

  } catch (error) {
    console.error('Retry emails error:', error)
    return results
  }
}
