// JTM Web - SMTP Email Client
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Create reusable SMTP transporter
let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) {
    return transporter
  }

  // Create SMTP transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  return transporter
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: {
    email: string
    name: string
  }
  replyTo?: string
  tags?: string[]
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  email: string
}

/**
 * Send an email using SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const fromEmail = options.from?.email || process.env.SMTP_FROM_EMAIL || 'noreply@jagadgurutemple.org'
    const fromName = options.from?.name || process.env.SMTP_FROM_NAME || 'JTM Community'

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    }

    const transporter = getTransporter()
    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
      response: info.response,
    })

    return {
      success: true,
      messageId: info.messageId,
      email: options.to,
    }
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${options.to}:`, error)

    return {
      success: false,
      error: error.message || 'Failed to send email',
      email: options.to,
    }
  }
}

/**
 * Send bulk emails (batch processing)
 */
export async function sendBulkEmails(emails: EmailOptions[]): Promise<EmailResult[]> {
  const results: EmailResult[] = []
  
  // Process emails in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(sendEmail))
    results.push(...batchResults)
    
    // Add a small delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log('✅ SMTP connection verified')
    return true
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
    return false
  }
}
