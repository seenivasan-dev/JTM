import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail, generateRenewalApprovedEmail, generateRenewalRejectedEmail } from '@/lib/email';

const renewalActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
});

// PUT /api/users/renewals/[id] - Process renewal request (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: renewalId } = await params
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
    const { action, adminNotes } = renewalActionSchema.parse(body);

    // Get the renewal request
    const renewal = await prisma.membershipRenewal.findUnique({
      where: { id: renewalId },
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
      where: { id: renewalId },
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
      const newExpiryDate = new Date(new Date().getFullYear() + 1, 11, 31, 23, 59, 59) // Dec 31st next year
      
      await prisma.user.update({
        where: { id: renewal.userId },
        data: {
          membershipType: renewal.newType,
          membershipExpiry: newExpiryDate,
          isActive: true,
        },
      });

      // Send approval email notification to member
      try {
        const emailTemplate = generateRenewalApprovedEmail({
          firstName: updatedRenewal.user.firstName,
          membershipType: renewal.newType,
          expiryDate: newExpiryDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          adminNotes,
        })

        await sendEmail({
          to: updatedRenewal.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['renewal', 'approved', renewal.newType],
        })

        console.log(`✅ Renewal approval email sent to ${updatedRenewal.user.email}`)
      } catch (emailError) {
        console.error(`❌ Failed to send renewal approval email to ${updatedRenewal.user.email}:`, emailError)
      }
    } else {
      // Send rejection email notification to member
      try {
        const emailTemplate = generateRenewalRejectedEmail({
          firstName: updatedRenewal.user.firstName,
          membershipType: renewal.newType,
          rejectionReason: adminNotes,
          contactEmail: process.env.ADMIN_EMAIL || 'admin@jaxtamilmandram.org',
        })

        await sendEmail({
          to: updatedRenewal.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          tags: ['renewal', 'rejected'],
        })

        console.log(`✅ Renewal rejection email sent to ${updatedRenewal.user.email}`)
      } catch (emailError) {
        console.error(`❌ Failed to send renewal rejection email to ${updatedRenewal.user.email}:`, emailError)
      }
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