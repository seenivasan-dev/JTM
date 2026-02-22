import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/committee-transition
 * Deactivates all non-SUPER_ADMIN admins from the previous committee year.
 * Only accessible to SUPER_ADMIN role.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the caller is a SUPER_ADMIN
    const callerAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!callerAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (callerAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required for committee transition' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const targetYear: number = body.targetYear ?? (new Date().getFullYear() - 1)

    // Deactivate all non-SUPER_ADMIN admins from the target year
    const result = await prisma.admin.updateMany({
      where: {
        year: targetYear,
        role: { not: 'SUPER_ADMIN' },
        isActive: true,
      },
      data: {
        isActive: false,
      }
    })

    return NextResponse.json({
      success: true,
      deactivated: result.count,
      targetYear,
      message: `Deactivated ${result.count} admin account(s) from ${targetYear} committee.`,
    })

  } catch (error) {
    console.error('Committee transition error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Committee transition failed' },
      { status: 500 }
    )
  }
}
