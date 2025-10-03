// JTM Web - Send Welcome Emails API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // TODO: Implement email service (Resend, SendGrid, etc.)
    // For now, we'll return a success response indicating emails would be sent
    
    const emailResults = []
    
    for (const user of users) {
      try {
        // TODO: Replace with actual email service implementation
        // Example with Resend:
        // await resend.emails.send({
        //   from: 'JTM Community <noreply@jtm.org>',
        //   to: user.email,
        //   subject: 'Welcome to JTM Community - Your Account is Ready',
        //   html: generateWelcomeEmailTemplate(user.firstName, user.tempPassword)
        // })

        // For now, just log the email details
        console.log(`Would send welcome email to ${user.email} with temp password: ${user.tempPassword}`)
        
        emailResults.push({
          email: user.email,
          status: 'success',
          message: 'Email queued for sending'
        })
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        emailResults.push({
          email: user.email,
          status: 'failed',
          message: 'Failed to send email'
        })
      }
    }

    const successCount = emailResults.filter(r => r.status === 'success').length
    const failedCount = emailResults.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Processed ${users.length} emails: ${successCount} succeeded, ${failedCount} failed`,
      results: emailResults,
      // TODO: Remove this placeholder message when email service is implemented
      note: 'Email service not yet implemented - emails are logged to console'
    })

  } catch (error) {
    console.error('Error sending welcome emails:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// TODO: Implement email template generation
function generateWelcomeEmailTemplate(firstName: string, tempPassword: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to JTM Community</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Welcome to JTM Community!</h1>
        
        <p>Hello ${firstName},</p>
        
        <p>Welcome to the JTM Community platform! Your account has been created successfully.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> Your registered email address</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 5px; border-radius: 3px;">${tempPassword}</code></p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">Important Security Notice:</h4>
          <p style="margin-bottom: 0; color: #856404;">You will be required to change your password upon first login for security purposes.</p>
        </div>
        
        <p>
          <a href="${process.env.NEXTAUTH_URL}/auth/login" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Your Account
          </a>
        </p>
        
        <p>If you have any questions or need assistance, please contact our admin team.</p>
        
        <p>Best regards,<br>JTM Community Team</p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #dee2e6;">
        <p style="font-size: 12px; color: #6c757d;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `
}