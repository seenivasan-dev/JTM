import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive password reset instructions.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    // Send password reset email
    const emailHtml = generatePasswordResetEmailHTML({
      firstName: user.firstName,
      resetLink,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: '🔐 Password Reset Request - JTM Community',
        html: emailHtml,
        text: `Hello ${user.firstName},\n\nWe received a request to reset your password.\n\nClick this link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nJTM Community Team`,
      });

      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Continue anyway - we don't want to reveal if email sending failed
    }

    return NextResponse.json(
      { 
        message: 'If an account exists with this email, you will receive password reset instructions.',
        // Remove this in production - only for development
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Email template for password reset
function generatePasswordResetEmailHTML(params: {
  firstName: string;
  resetLink: string;
}): string {
  const { firstName, resetLink } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header with Tamil Cultural Gradient -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #2563eb 50%, #10b981 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset Request</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Jacksonville Tamil Mandram</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; margin-bottom: 20px; color: #1f2937;">Hello <strong>${firstName}</strong>,</p>
      
      <p style="color: #4b5563; margin-bottom: 20px;">We received a request to reset your password for your JTM Community account. Click the button below to create a new password:</p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #2563eb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          Reset My Password
        </a>
      </div>
      
      <!-- Security Notice -->
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #92400e; font-size: 16px; font-weight: 600;">🔒 Security Information</h3>
        <ul style="color: #78350f; margin-bottom: 0; padding-left: 20px; line-height: 1.8;">
          <li>This password reset link will expire in <strong>1 hour</strong></li>
          <li>The link can only be used once</li>
          <li>If you didn't request this reset, please ignore this email</li>
          <li>Your password will remain unchanged unless you click the link above</li>
        </ul>
      </div>
      
      <!-- Alternative Link -->
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="margin: 0; word-break: break-all; font-size: 13px;">
          <a href="${resetLink}" style="color: #2563eb; text-decoration: none;">${resetLink}</a>
        </p>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>

      <p style="margin-top: 25px; color: #4b5563;">Best regards,<br><strong>JTM Community Team</strong></p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; text-align: center; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated security message. Please do not reply to this email.</p>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">© ${new Date().getFullYear()} Jacksonville Tamil Mandram. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
