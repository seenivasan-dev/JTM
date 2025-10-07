import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const renewalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
});

// PUT /api/users/renewals/[id] - Process renewal request (Admin only)
export async function PUT(
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
    const body = await request.json();
    const { action, adminNotes } = renewalActionSchema.parse(body);

    // Get the renewal request
    const renewal = await prisma.membershipRenewal.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!renewal) {
      return NextResponse.json({ error: 'Renewal request not found' }, { status: 404 });
    }

    if (renewal.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Renewal request has already been processed' 
      }, { status: 400 });
    }

    // Update renewal status
    const updatedRenewal = await prisma.membershipRenewal.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        adminNotes,
        processedAt: new Date(),
        processedBy: admin.id,
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

    // If approved, update user's membership type and expiry
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: renewal.userId },
        data: {
          membershipType: renewal.newType,
          membershipExpiry: new Date(new Date().getFullYear() + 1, 11, 31, 23, 59, 59), // Dec 31st next year
          isActive: true,
        },
      });

      // TODO: Send approval email notification to member
      // await sendRenewalApprovalEmail(updatedRenewal.user.email, {
      //   memberName: `${updatedRenewal.user.firstName} ${updatedRenewal.user.lastName}`,
      //   membershipType: renewal.newType,
      //   expiryDate: new Date(new Date().getFullYear() + 1, 11, 31, 23, 59, 59).toISOString(),
      //   adminNotes
      // })
      
      console.log(`📧 [EMAIL PLACEHOLDER] Renewal approval sent to ${updatedRenewal.user.email}`)
      console.log(`   Member: ${updatedRenewal.user.firstName} ${updatedRenewal.user.lastName}`)
      console.log(`   Approved Membership: ${renewal.newType}`)
      console.log(`   New Expiry: Dec 31, ${new Date().getFullYear() + 1}`)
    } else {
      // TODO: Send rejection email notification to member
      // await sendRenewalRejectionEmail(updatedRenewal.user.email, {
      //   memberName: `${updatedRenewal.user.firstName} ${updatedRenewal.user.lastName}`,
      //   membershipType: renewal.newType,
      //   rejectionReason: adminNotes || 'No specific reason provided',
      //   contactInfo: 'admin@jtm.org'
      // })
      
      console.log(`📧 [EMAIL PLACEHOLDER] Renewal rejection sent to ${updatedRenewal.user.email}`)
      console.log(`   Member: ${updatedRenewal.user.firstName} ${updatedRenewal.user.lastName}`)
      console.log(`   Rejected Membership: ${renewal.newType}`)
      console.log(`   Reason: ${adminNotes || 'No specific reason provided'}`)
    }

    return NextResponse.json({
      message: `Renewal request ${action}d successfully`,
      renewal: updatedRenewal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    
    console.error('Error processing renewal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}