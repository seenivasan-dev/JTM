import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const bulkUserSchema = z.object({
  users: z.array(z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
    membershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']),
    address: z.object({
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(5, 'ZIP code is required'),
      country: z.string().default('USA'),
    }),
    familyMembers: z.array(z.object({
      firstName: z.string().min(2, 'First name is required'),
      lastName: z.string().min(2, 'Last name is required'),
      age: z.number().min(0).max(150, 'Invalid age'),
      contactNumber: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      relationship: z.string().min(2, 'Relationship is required'),
    })).optional(),
  })),
});

const bulkActivationSchema = z.object({
  userIds: z.array(z.string()),
  action: z.enum(['activate', 'deactivate']),
});

// POST /api/users/bulk-import - Import users from Excel data
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Check if this is a bulk activation/deactivation request
    if (body.action === 'activate' || body.action === 'deactivate') {
      const { userIds, action } = bulkActivationSchema.parse(body);
      
      if (action === 'activate') {
        const activatedUsers = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            isActive: false, // Only activate inactive users
          },
          data: {
            isActive: true,
            activatedBy: admin.id,
            activatedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: `Successfully activated ${activatedUsers.count} users`,
          activatedCount: activatedUsers.count,
        });
      } else if (action === 'deactivate') {
        const deactivatedUsers = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            isActive: true, // Only deactivate active users
          },
          data: {
            isActive: false,
          },
        });

        return NextResponse.json({
          message: `Successfully deactivated ${deactivatedUsers.count} users`,
          deactivatedCount: deactivatedUsers.count,
        });
      }
    }

    // Otherwise, handle bulk import
    const validatedData = bulkUserSchema.parse(body);
    
    const results = {
      successful: [],
      failed: [],
      duplicates: [],
    } as {
      successful: Record<string, unknown>[];
      failed: Record<string, unknown>[];
      duplicates: Record<string, unknown>[];
    };

    // Check for existing emails
    const existingEmails = await prisma.user.findMany({
      where: {
        email: { in: validatedData.users.map(u => u.email) },
      },
      select: { email: true },
    });

    const existingEmailSet = new Set(existingEmails.map(u => u.email));

    // Process each user
    for (const userData of validatedData.users) {
      try {
        // Check for duplicates
        if (existingEmailSet.has(userData.email)) {
          results.duplicates.push({
            email: userData.email,
            error: 'User with this email already exists',
          });
          continue;
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

        // Create user with address and family members
        const user = await prisma.user.create({
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            mobileNumber: userData.mobileNumber,
            membershipType: userData.membershipType,
            tempPassword: hashedTempPassword,
            mustChangePassword: true,
            importedFromExcel: true,
            address: {
              create: userData.address,
            },
            familyMembers: userData.familyMembers ? {
              create: userData.familyMembers,
            } : undefined,
          },
          include: {
            address: true,
            familyMembers: true,
          },
        });

        results.successful.push({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tempPassword, // Remove this in production - send via email
        });

        // Add to existing emails set to prevent duplicates in the same batch
        existingEmailSet.add(userData.email);
      } catch (error) {
        results.failed.push({
          email: userData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk import completed',
      summary: {
        total: validatedData.users.length,
        successful: results.successful.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length,
      },
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    
    console.error('Error in bulk import:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}