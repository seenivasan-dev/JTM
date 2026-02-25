// JTM Web - Admin Send Notification API
// Sends email blast to members with optional flyer image attachment
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBulkEmails, generateNotificationBlastEmail } from '@/lib/email'
import type { EmailOptions } from '@/lib/email'
import { MembershipType, Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Parse multipart/form-data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    const recipients = (formData.get('recipients') as string) || 'all'
    const flyerFile = formData.get('flyer') as File | null

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Build where clause based on recipients filter
    const whereClause: Prisma.UserWhereInput = {}
    if (recipients === 'active') {
      whereClause.isActive = true
    } else if (recipients === 'inactive') {
      whereClause.isActive = false
    } else if (recipients === 'family') {
      whereClause.membershipType = MembershipType.FAMILY
    } else if (recipients === 'individual') {
      whereClause.membershipType = MembershipType.INDIVIDUAL
    }
    // 'all' — no filter

    const members = await prisma.user.findMany({
      where: whereClause,
      select: { firstName: true, email: true },
    })

    if (members.length === 0) {
      return NextResponse.json({ error: 'No members found for the selected recipient group' }, { status: 400 })
    }

    // Process flyer image to buffer if provided
    let flyerBuffer: Buffer | null = null
    let flyerMimeType = 'image/jpeg'
    if (flyerFile && flyerFile.size > 0) {
      const arrayBuffer = await flyerFile.arrayBuffer()
      flyerBuffer = Buffer.from(arrayBuffer)
      flyerMimeType = flyerFile.type || 'image/jpeg'
    }

    const hasFlyerImage = flyerBuffer !== null

    // Build email list
    const emails: EmailOptions[] = members.map((member) => {
      const { subject, html, text } = generateNotificationBlastEmail({
        firstName: member.firstName,
        title,
        message,
        hasFlyerImage,
      })

      const emailOptions: EmailOptions = {
        to: member.email,
        subject,
        html,
        text,
      }

      if (flyerBuffer) {
        emailOptions.attachments = [
          {
            filename: flyerFile!.name || 'flyer.jpg',
            content: flyerBuffer,
            contentType: flyerMimeType,
            cid: 'event-flyer',
          },
        ]
      }

      return emailOptions
    })

    const results = await sendBulkEmails(emails)
    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: `Notification sent to ${succeeded} member${succeeded !== 1 ? 's' : ''}${failed > 0 ? ` (${failed} failed)` : ''}.`,
      succeeded,
      failed,
      total: members.length,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
