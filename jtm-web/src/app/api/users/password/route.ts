import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const setNewPasswordSchema = z.object({
  tempPassword: z.string().min(1, 'Temporary password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

// PUT /api/users/password/change - Change password for authenticated user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a regular password or temp password
    let isCurrentPasswordValid = false;
    
    if (user.password) {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    } else if (user.tempPassword) {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.tempPassword);
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        tempPassword: null, // Clear temp password
        mustChangePassword: false,
        lastLogin: new Date(),
      },
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/password/reset - Reset password (send temp password)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'reset') {
      const { email } = resetPasswordSchema.parse(body);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({ 
          message: 'If an account with this email exists, a password reset link will be sent.' 
        });
      }

      // Generate new temporary password (8 chars: letters + numbers + symbols)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let tempPassword = '';
      for (let i = 0; i < 8; i++) {
        tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

      // Send email BEFORE updating database
      const loginUrl = `${process.env.WEB_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login`;
      
      try {
        const emailTemplate = generatePasswordResetEmail({
          firstName: user.firstName,
          email: user.email,
          tempPassword,
          loginUrl,
        });

        const emailResult = await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['password-reset', 'security'],
        });

        if (!emailResult.success) {
          console.error(`❌ Failed to send password reset email to ${user.email}:`, emailResult.error);
          return NextResponse.json({ 
            error: 'Failed to send password reset email. Please try again or contact support.',
            details: emailResult.error,
          }, { status: 500 });
        }

        console.log(`✅ Password reset email sent successfully to ${user.email}`);

        // Update user with temp password AFTER successful email
        await prisma.user.update({
          where: { id: user.id },
          data: {
            tempPassword: hashedTempPassword,
            mustChangePassword: true,
          },
        });

        console.log(`🔑 Temporary password set for ${user.email}`);
        
        return NextResponse.json({ 
          message: 'A temporary password has been sent to your email. Please check your inbox.',
          success: true,
        });
      } catch (emailError) {
        console.error(`❌ Error sending password reset email to ${user.email}:`, emailError);
        return NextResponse.json({ 
          error: 'Failed to send password reset email. Please try again later.',
        }, { status: 500 });
      }
    }

    if (body.action === 'set-new') {
      const { tempPassword, newPassword } = setNewPasswordSchema.parse(body);
      const email = body.email;

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.tempPassword) {
        return NextResponse.json({ error: 'Invalid or expired temporary password' }, { status: 400 });
      }

      // Verify temp password
      const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
      
      if (!isTempPasswordValid) {
        return NextResponse.json({ error: 'Invalid temporary password' }, { status: 400 });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          tempPassword: null,
          mustChangePassword: false,
          lastLogin: new Date(),
        },
      });

      return NextResponse.json({ message: 'Password set successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    
    console.error('Error in password reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}