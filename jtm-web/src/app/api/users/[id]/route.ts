import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { generateWelcomeEmail } from '@/lib/email/templates';

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  mobileNumber: z.string().min(10).optional(),
  membershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']).optional(),
  isActive: z.boolean().optional(),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(5),
    country: z.string().default('USA'),
  }).optional(),
  familyMembers: z.array(z.object({
    id: z.string().optional(), // For updating existing family members
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    age: z.number().min(0).max(150),
    contactNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    relationship: z.string().min(2),
  })).optional(),
});

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Users can view their own profile, admins can view any profile
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!isAdmin && currentUser?.id !== id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        address: true,
        familyMembers: true,
        notifications: true,
        _count: {
          select: {
            rsvpResponses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const sanitizedUser = {
      ...user,
      password: undefined,
      tempPassword: undefined,
    };

    return NextResponse.json({ user: sanitizedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Get the user being updated (for checking activation status)
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Users can update their own profile, admins can update any profile
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!isAdmin && currentUser?.id !== id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user is being activated
    const isBeingActivated = isAdmin && 
                            validatedData.isActive === true && 
                            existingUser.isActive === false;

    // Generate temp password and send email BEFORE activation
    // If email fails, we won't activate the user
    let tempPasswordPlainText: string | undefined;
    
    if (isBeingActivated) {
      // Generate temporary password
      tempPasswordPlainText = Math.random().toString(36).slice(-8);
      console.log(`🔑 Generated new temp password for ${existingUser.email} upon ${existingUser.tempPassword ? 're-' : ''}activation`);

      // Try to send email BEFORE activating
      try {
        const emailTemplate = generateWelcomeEmail({
          firstName: existingUser.firstName,
          email: existingUser.email,
          tempPassword: tempPasswordPlainText,
          loginUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login`,
        });

        const emailResult = await sendEmail({
          to: existingUser.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['activation', 'welcome', 'user-activation'],
        });

        if (!emailResult.success) {
          // Email failed - don't activate the user
          console.error(`❌ Email failed for ${existingUser.email}:`, emailResult.error);
          return NextResponse.json({
            error: 'Failed to send activation email. User was not activated.',
            details: emailResult.error,
            suggestion: 'Please check SMTP configuration and try again, or use the resend-activation endpoint after fixing email issues.'
          }, { status: 500 });
        }

        console.log(`✅ Welcome email sent to ${existingUser.email} - proceeding with activation`);
      } catch (error) {
        // Email sending threw an exception - don't activate
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Email exception for ${existingUser.email}:`, errorMsg);
        return NextResponse.json({
          error: 'Failed to send activation email. User was not activated.',
          details: errorMsg,
          suggestion: 'Please check SMTP configuration and try again.'
        }, { status: 500 });
      }
    }

    // Prepare update data (only reached if email succeeded or not activating)
    const updateData: Record<string, unknown> = {};

    // Store the hashed temp password if we're activating
    if (isBeingActivated && tempPasswordPlainText) {
      updateData.tempPassword = await bcrypt.hash(tempPasswordPlainText, 12);
      updateData.mustChangePassword = true;
    }
    
    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.mobileNumber) updateData.mobileNumber = validatedData.mobileNumber;
    if (validatedData.membershipType) updateData.membershipType = validatedData.membershipType;
    
    // Only admins can change isActive status
    if (isAdmin && validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
      if (validatedData.isActive) {
        updateData.activatedBy = currentUser?.id;
        updateData.activatedAt = new Date();
      }
    }

    // Handle address update
    if (validatedData.address) {
      updateData.address = {
        upsert: {
          create: validatedData.address,
          update: validatedData.address,
        },
      };
    }

    // Handle family members update
    if (validatedData.familyMembers) {
      // Delete existing family members and create new ones
      updateData.familyMembers = {
        deleteMany: {},
        create: validatedData.familyMembers.map(fm => ({
          firstName: fm.firstName,
          lastName: fm.lastName,
          age: fm.age,
          contactNumber: fm.contactNumber || null,
          email: fm.email || null,
          relationship: fm.relationship,
        })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        address: true,
        familyMembers: true,
        notifications: true,
      },
    });

    // Email was already sent before activation (if activating)
    // Return success response
    return NextResponse.json({
      message: isBeingActivated 
        ? 'User activated successfully and welcome email sent' 
        : 'User updated successfully',
      user: {
        ...updatedUser,
        password: undefined,
        tempPassword: undefined,
      },
      ...(isBeingActivated && {
        emailSent: true,
      })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}