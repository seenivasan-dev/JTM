// JTM Web - Mailchimp Transactional Email Client
// @ts-ignore - Mailchimp package doesn't have TypeScript definitions
import mailchimp from '@mailchimp/mailchimp_transactional'

// Initialize Mailchimp Transactional client
const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY || 'test-api-key')

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
 * Send an email using Mailchimp Transactional (Mandrill)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const fromEmail = options.from?.email || process.env.MAILCHIMP_FROM_EMAIL || 'noreply@jagadgurutemple.org'
    const fromName = options.from?.name || process.env.MAILCHIMP_FROM_NAME || 'JTM Community'

    const message: any = {
      from_email: fromEmail,
      from_name: fromName,
      to: [
        {
          email: options.to,
          type: 'to' as const,
        },
      ],
      subject: options.subject,
      html: options.html,
      text: options.text,
      tags: options.tags || [],
      track_opens: true,
      track_clicks: true,
      auto_text: !options.text, // Auto-generate text version if not provided
      inline_css: true,
    }

    if (options.replyTo) {
      message.headers = {
        'Reply-To': options.replyTo,
      }
    }

    const response = await mailchimpClient.messages.send({
      message,
    })

    // Mailchimp returns an array of results
    if (response && response[0]) {
      const result = response[0]
      
      if (result.status === 'sent' || result.status === 'queued' || result.status === 'scheduled') {
        console.log(`✅ Email sent successfully to ${options.to}`, {
          messageId: result._id,
          status: result.status,
        })
        
        return {
          success: true,
          messageId: result._id,
          email: options.to,
        }
      } else if (result.status === 'rejected' || result.status === 'invalid') {
        console.error(`❌ Email rejected for ${options.to}:`, result.reject_reason)
        
        return {
          success: false,
          error: result.reject_reason || 'Email rejected',
          email: options.to,
        }
      }
    }

    throw new Error('Unexpected response from Mailchimp')
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
 * Verify Mailchimp API key
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    const response = await mailchimpClient.users.ping()
    console.log('✅ Mailchimp connection verified:', response)
    return true
  } catch (error) {
    console.error('❌ Mailchimp connection failed:', error)
    return false
  }
}
