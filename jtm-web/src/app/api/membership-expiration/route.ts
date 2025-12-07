// JTM Web - Automatic Membership Expiration API
// This endpoint runs the automatic membership expiration check
// Called automatically by the system and can be triggered manually by admins

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  expireAllMemberships, 
  manualExpireAllMemberships,
  getExpirationStatus 
} from '@/lib/membership-expiration';

// GET - Get expiration status (anyone can check)
export async function GET(request: NextRequest) {
  try {
    const status = await getExpirationStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error getting expiration status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get expiration status' },
      { status: 500 }
    );
  }
}

// POST - Trigger automatic expiration (runs only on Jan 1st unless manual=true)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { manual = false } = body;

    // If manual trigger, require admin authentication
    if (manual) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Verify admin
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
      });

      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Manual expiration triggered by admin
      const result = await manualExpireAllMemberships();
      
      return NextResponse.json({
        success: true,
        manual: true,
        data: result,
      });
    }

    // Automatic expiration (only runs on January 1st)
    const result = await expireAllMemberships();
    
    return NextResponse.json({
      success: true,
      manual: false,
      data: result,
    });

  } catch (error) {
    console.error('Error in membership expiration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to expire memberships' 
      },
      { status: 500 }
    );
  }
}
