import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { generateWelcomeEmail } from '@/lib/email/templates';

// POST /api/users/[id]/resend-activation - Resend activation email with new temp password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can resend activation emails
    const isAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'User is not active. Please activate the user first.' 
      }, { status: 400 });
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

    // Update user with new temp password
    await prisma.user.update({
      where: { id },
      data: {
        tempPassword: hashedTempPassword,
        mustChangePassword: true,
      },
    });

    console.log(`🔑 Generated new temp password for ${user.email} (resend activation email)`);

    // Send welcome email
    try {
      // Ensure loginUrl has protocol
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const loginUrl = baseUrl.startsWith('http') ? `${baseUrl}/auth/login` : `https://${baseUrl}/auth/login`;
      
      const emailTemplate = generateWelcomeEmail({
        firstName: user.firstName,
        email: user.email,
        tempPassword: tempPassword,
        loginUrl,
      });

      const emailResult = await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        tags: ['activation', 'welcome', 'resend'],
      });

      if (emailResult.success) {
        console.log(`✅ Activation email resent to ${user.email}`);
        return NextResponse.json({
          success: true,
          message: `Activation email successfully sent to ${user.email}`,
          emailSent: true,
        });
      } else {
        console.error(`❌ Failed to send activation email to ${user.email}:`, emailResult.error);
        return NextResponse.json({
          success: false,
          message: 'Failed to send email',
          error: emailResult.error,
          tempPassword: tempPassword, // Return temp password if email failed
          emailSent: false,
        }, { status: 500 });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to send activation email to ${user.email}:`, errorMsg);
      return NextResponse.json({
        success: false,
        message: 'Failed to send email',
        error: errorMsg,
        tempPassword: tempPassword, // Return temp password if email failed
        emailSent: false,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error resending activation email:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
