import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

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

      // Generate new temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

      // Update user with temp password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tempPassword: hashedTempPassword,
          mustChangePassword: true,
        },
      });

      // TODO: Send email with temporary password
      // For now, return temp password (remove in production)
      
      return NextResponse.json({ 
        message: 'Temporary password sent to your email',
        tempPassword, // Remove this in production
      });
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