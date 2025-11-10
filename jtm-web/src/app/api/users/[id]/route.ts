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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
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

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Generate temp password if activating a user who doesn't have one
    let tempPasswordPlainText: string | undefined;
    if (isBeingActivated && !existingUser.tempPassword) {
      tempPasswordPlainText = Math.random().toString(36).slice(-8);
      // Store hashed version in database
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

    // Send welcome email if user was just activated
    if (isBeingActivated && tempPasswordPlainText) {
      try {
        const emailTemplate = generateWelcomeEmail({
          firstName: updatedUser.firstName,
          email: updatedUser.email,
          tempPassword: tempPasswordPlainText, // Use the plain text version for email
          loginUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login`,
        });

        const emailResult = await sendEmail({
          to: updatedUser.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['activation', 'welcome', 'user-activation'],
        });

        if (emailResult.success) {
          console.log(`✅ Welcome email sent to ${updatedUser.email} upon activation with temp password`);
        } else {
          console.error(`❌ Failed to send welcome email to ${updatedUser.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send welcome email to ${updatedUser.email}:`, emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        password: undefined,
        tempPassword: undefined,
      },
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
  { params }: { params: { id: string } }
) {
  try {
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

    const { id } = params;

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