// JTM Web - Renewal Reminder API Route
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/renewal-reminders - Send renewal reminders to members
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get current date and calculate renewal period
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const reminderStartDate = new Date(currentYear, 9, 1) // October 1st
    const expiryDate = new Date(currentYear, 11, 31, 23, 59, 59) // Dec 31st

    // Find members whose memberships expire this year and haven't renewed
    const membersNeedingRenewal = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { membershipExpiry: { lte: expiryDate } },
          { membershipExpiry: null }, // Members without expiry date (legacy)
        ],
        renewalRequests: {
          none: {
            status: 'PENDING',
          },
        },
      },
      include: {
        address: true,
        familyMembers: true,
      },
    })

    // Send renewal reminders
    const reminderResults = []
    
    for (const member of membersNeedingRenewal) {
      // Calculate days until expiry
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // TODO: Send renewal reminder email
      // await sendRenewalReminderEmail(member.email, {
      //   memberName: `${member.firstName} ${member.lastName}`,
      //   membershipType: member.membershipType,
      //   expiryDate: member.membershipExpiry?.toISOString() || expiryDate.toISOString(),
      //   daysUntilExpiry,
      //   renewalUrl: `${process.env.NEXTAUTH_URL}/renewal`,
      //   familyMemberCount: member.familyMembers.length
      // })

      console.log(`📧 [EMAIL PLACEHOLDER] Renewal reminder sent to ${member.email}`)
      console.log(`   Member: ${member.firstName} ${member.lastName}`)
      console.log(`   Membership Type: ${member.membershipType}`)
      console.log(`   Days Until Expiry: ${daysUntilExpiry}`)
      console.log(`   Family Members: ${member.familyMembers.length}`)

      reminderResults.push({
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        email: member.email,
        daysUntilExpiry,
        status: 'sent'
      })
    }

    return NextResponse.json({
      message: `Renewal reminders sent to ${reminderResults.length} members`,
      results: reminderResults,
      summary: {
        totalReminders: reminderResults.length,
        currentDate: currentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error sending renewal reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/renewal-reminders - Get renewal reminder statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const expiryDate = new Date(currentYear, 11, 31, 23, 59, 59) // Dec 31st

    // Get statistics
    const totalActiveMembers = await prisma.user.count({
      where: { isActive: true }
    })

    const membersNeedingRenewal = await prisma.user.count({
      where: {
        isActive: true,
        OR: [
          { membershipExpiry: { lte: expiryDate } },
          { membershipExpiry: null },
        ],
        renewalRequests: {
          none: {
            status: 'PENDING',
          },
        },
      }
    })

    const pendingRenewals = await prisma.membershipRenewal.count({
      where: { status: 'PENDING' }
    })

    const approvedRenewals = await prisma.membershipRenewal.count({
      where: { 
        status: 'APPROVED',
        createdAt: {
          gte: new Date(currentYear, 0, 1), // This year
        }
      }
    })

    return NextResponse.json({
      statistics: {
        totalActiveMembers,
        membersNeedingRenewal,
        pendingRenewals,
        approvedRenewals,
        renewalRate: totalActiveMembers > 0 ? Math.round((approvedRenewals / totalActiveMembers) * 100) : 0,
        expiryDate: expiryDate.toISOString(),
        daysUntilExpiry: Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    })

  } catch (error) {
    console.error('Error getting renewal statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}