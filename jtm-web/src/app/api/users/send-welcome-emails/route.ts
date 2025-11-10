// JTM Web - Send Welcome Emails API
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateWelcomeEmail } from '@/lib/email'

interface WelcomeEmailUser {
  email: string
  firstName: string
  tempPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { users }: { users: WelcomeEmailUser[] } = await request.json()

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Invalid users data' }, { status: 400 })
    }

    const emailResults = []
    const loginUrl = `${process.env.WEB_APP_URL || process.env.NEXTAUTH_URL}/auth/login`
    
    for (const user of users) {
      try {
        // Generate email template
        const emailTemplate = generateWelcomeEmail({
          firstName: user.firstName,
          email: user.email,
          tempPassword: user.tempPassword,
          loginUrl,
        })

        // Send email using Mailchimp
        const result = await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['welcome', 'new-user'],
        })

        emailResults.push({
          email: user.email,
          status: result.success ? 'success' : 'failed',
          message: result.success ? 'Email sent successfully' : result.error || 'Failed to send email',
          messageId: result.messageId,
        })

        console.log(`✅ Welcome email sent to ${user.email}`)
      } catch (error: any) {
        console.error(`❌ Failed to send email to ${user.email}:`, error)
        emailResults.push({
          email: user.email,
          status: 'failed',
          message: error.message || 'Failed to send email'
        })
      }
    }

    const successCount = emailResults.filter(r => r.status === 'success').length
    const failedCount = emailResults.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} welcome emails successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      results: emailResults,
      stats: {
        total: users.length,
        successful: successCount,
        failed: failedCount,
      }
    })

  } catch (error) {
    console.error('❌ Error sending welcome emails:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}