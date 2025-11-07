// JTM Web - Password Change API Route
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        password: true,
        tempPassword: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password (check both hashed password and temp password)
    let isCurrentPasswordValid = false;

    if (user.tempPassword && user.tempPassword === validatedData.currentPassword) {
      // User is using temporary password
      isCurrentPasswordValid = true;
    } else if (user.password) {
      // User has a permanent password, verify it
      isCurrentPasswordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      );
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Prevent reusing temporary password as new password
    if (user.tempPassword === validatedData.newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'New password cannot be the same as your temporary password' 
        },
        { status: 400 }
      );
    }

    // Prevent reusing current password
    if (user.password) {
      const isSameAsCurrentPassword = await bcrypt.compare(
        validatedData.newPassword,
        user.password
      );
      if (isSameAsCurrentPassword) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'New password cannot be the same as your current password' 
          },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update user password and clear temporary password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        tempPassword: null,
        mustChangePassword: false,
        lastLogin: new Date(),
      },
    });

    console.log(`✅ Password changed successfully for ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. You can now login with your new password.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}