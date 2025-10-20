import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail, generateRenewalRequestEmail, generateAdminRenewalNotificationEmail } from '@/lib/email';

const renewalRequestSchema = z.object({
  newMembershipType: z.enum(['INDIVIDUAL', 'FAMILY', 'CUSTOM']),
  paymentReference: z.string().min(5, 'Payment reference is required'),
  familyMembers: z.array(z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    age: z.number().min(0).max(150, 'Invalid age'),
    contactNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    relationship: z.string().min(2, 'Relationship is required'),
  })).optional(),
});

const renewalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
});

// GET /api/users/renewals - Get all renewal requests (Admin) or user's renewal (Member)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    const where: Record<string, unknown> = {};

    if (admin) {
      // Admin can see all renewals
      if (status) {
        where.status = status.toUpperCase();
      }
    } else {
      // Regular user can only see their own renewals
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      where.userId = user.id;
    }

    const [renewals, total] = await Promise.all([
      prisma.membershipRenewal.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              membershipType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.membershipRenewal.count({ where }),
    ]);

    return NextResponse.json({
      renewals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching renewals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/renewals - Create renewal request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = renewalRequestSchema.parse(body);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { familyMembers: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a pending renewal
    const existingRenewal = await prisma.membershipRenewal.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (existingRenewal) {
      return NextResponse.json({ 
        error: 'You already have a pending renewal request' 
      }, { status: 400 });
    }

    // Create renewal request
    const renewal = await prisma.membershipRenewal.create({
      data: {
        userId: user.id,
        previousType: user.membershipType,
        newType: validatedData.newMembershipType,
        paymentReference: validatedData.paymentReference,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            membershipType: true,
          },
        },
      },
    });

    // If family members are provided and membership type is FAMILY, update them
    if (validatedData.familyMembers && validatedData.newMembershipType === 'FAMILY') {
      await prisma.familyMember.deleteMany({
        where: { userId: user.id },
      });

      await prisma.familyMember.createMany({
        data: validatedData.familyMembers.map(fm => ({
          ...fm,
          userId: user.id,
        })),
      });
    }

    // Send email notification to member confirming renewal request submission
    try {
      const emailTemplate = generateRenewalRequestEmail({
        firstName: user.firstName,
        membershipType: validatedData.newMembershipType,
        paymentReference: validatedData.paymentReference,
        submissionDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      })

      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        tags: ['renewal', 'confirmation', validatedData.newMembershipType],
      })

      console.log(`✅ Renewal request confirmation sent to ${user.email}`)
    } catch (emailError) {
      console.error(`❌ Failed to send renewal confirmation email to ${user.email}:`, emailError)
    }

    // Send email notification to admin about new renewal request
    try {
      const adminUrl = `${process.env.WEB_APP_URL || process.env.NEXTAUTH_URL}/admin/renewals?id=${renewal.id}`
      
      const emailTemplate = generateAdminRenewalNotificationEmail({
        memberName: `${user.firstName} ${user.lastName}`,
        memberEmail: user.email,
        membershipType: validatedData.newMembershipType,
        paymentReference: validatedData.paymentReference,
        renewalId: renewal.id,
        adminUrl,
      })

      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@jagadgurutemple.org',
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        tags: ['renewal', 'admin-notification'],
      })

      console.log(`✅ Admin notification sent for renewal request ${renewal.id}`)
    } catch (emailError) {
      console.error(`❌ Failed to send admin notification email:`, emailError)
    }

    return NextResponse.json({
      message: 'Renewal request submitted successfully',
      renewal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    
    console.error('Error creating renewal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}