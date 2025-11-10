// JTM Web - Membership Renewal Cron Job API
// This endpoint should be called on January 1st annually to deactivate all memberships
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret key (for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 [Membership Renewal] Starting annual renewal process...')

    // Get all active users
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
      },
    })

    console.log(`📊 [Membership Renewal] Found ${activeUsers.length} active members`)

    // Deactivate all users and set expiry date
    const result = await prisma.user.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
        membershipExpiry: new Date(), // Set expiry to today
      },
    })

    console.log(`✅ [Membership Renewal] Deactivated ${result.count} memberships`)

    // TODO: Send renewal notification emails to all members
    // This would integrate with your email service

    return NextResponse.json({
      success: true,
      message: `Successfully deactivated ${result.count} memberships for annual renewal`,
      data: {
        totalDeactivated: result.count,
        processedAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('❌ [Membership Renewal] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process membership renewal' },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint (GET) for testing purposes
export async function GET(request: NextRequest) {
  try {
    // Get count of active users
    const activeCount = await prisma.user.count({
      where: { isActive: true },
    })

    const nextRenewalDate = new Date(new Date().getFullYear() + 1, 0, 1) // January 1st next year

    return NextResponse.json({
      success: true,
      data: {
        currentActiveMembers: activeCount,
        nextRenewalDate: nextRenewalDate.toISOString(),
        message: 'Use POST with authorization header to trigger renewal',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
