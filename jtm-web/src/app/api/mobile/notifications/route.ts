// JTM Web - Mobile Notifications API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get user to validate
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get notifications for the user
    const notifications = await getNotificationsForUser(user.id)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getNotificationsForUser(userId: string) {
  const notifications = []
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // 1. RSVP Status Updates
  const rsvpUpdates = await prisma.rSVPResponse.findMany({
    where: {
      userId,
      updatedAt: {
        gte: sevenDaysAgo
      },
      OR: [
        { paymentConfirmed: true },
        { checkedIn: true }
      ]
    },
    include: {
      event: {
        select: {
          title: true,
          date: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  for (const rsvp of rsvpUpdates) {
    if (rsvp.paymentConfirmed && rsvp.qrCode) {
      notifications.push({
        id: `rsvp-approved-${rsvp.id}`,
        type: 'rsvp_approved',
        title: 'RSVP Approved! 🎉',
        message: `Your RSVP for "${rsvp.event.title}" has been approved. Your QR code is ready!`,
        timestamp: rsvp.updatedAt.toISOString(),
        read: false,
        data: {
          eventId: rsvp.eventId,
          rsvpId: rsvp.id,
          qrCode: rsvp.qrCode
        }
      })
    }

    if (rsvp.checkedIn) {
      notifications.push({
        id: `rsvp-checkedin-${rsvp.id}`,
        type: 'event_checkin',
        title: 'Successfully Checked In! ✅',
        message: `You have been checked in to "${rsvp.event.title}". Enjoy the event!`,
        timestamp: rsvp.checkedInAt?.toISOString() || rsvp.updatedAt.toISOString(),
        read: false,
        data: {
          eventId: rsvp.eventId,
          rsvpId: rsvp.id
        }
      })
    }
  }

  // 2. Upcoming Events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      date: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      rsvpRequired: true
    },
    include: {
      rsvpResponses: {
        where: {
          userId
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  for (const event of upcomingEvents) {
    const userRsvp = event.rsvpResponses[0]
    
    // Notify about event reminder
    if (userRsvp && userRsvp.paymentConfirmed) {
      const eventDate = new Date(event.date)
      const timeDiff = eventDate.getTime() - now.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

      if (daysDiff <= 3 && daysDiff > 0) {
        notifications.push({
          id: `event-reminder-${event.id}`,
          type: 'event_reminder',
          title: `Event Reminder 📅`,
          message: `"${event.title}" is in ${daysDiff} day${daysDiff > 1 ? 's' : ''}. Don't forget to bring your QR code!`,
          timestamp: now.toISOString(),
          read: false,
          data: {
            eventId: event.id,
            eventDate: event.date.toISOString()
          }
        })
      }
    } else if (!userRsvp && event.rsvpDeadline) {
      // Remind about RSVP deadline
      const rsvpDeadline = new Date(event.rsvpDeadline)
      const deadlineTimeDiff = rsvpDeadline.getTime() - now.getTime()
      const deadlineDaysDiff = Math.ceil(deadlineTimeDiff / (1000 * 60 * 60 * 24))

      if (deadlineDaysDiff <= 2 && deadlineDaysDiff > 0) {
        notifications.push({
          id: `rsvp-deadline-${event.id}`,
          type: 'rsvp_deadline',
          title: `RSVP Deadline Reminder ⏰`,
          message: `RSVP deadline for "${event.title}" is in ${deadlineDaysDiff} day${deadlineDaysDiff > 1 ? 's' : ''}. Don't miss out!`,
          timestamp: now.toISOString(),
          read: false,
          data: {
            eventId: event.id,
            rsvpDeadline: event.rsvpDeadline.toISOString()
          }
        })
      }
    }
  }

  // 3. Membership Renewal Reminders
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      membershipExpiry: true,
      firstName: true
    }
  })

  if (user?.membershipExpiry) {
    const expiryDate = new Date(user.membershipExpiry)
    const timeDiff = expiryDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    if (daysDiff <= 30 && daysDiff > 0) {
      notifications.push({
        id: `membership-renewal-${userId}`,
        type: 'membership_renewal',
        title: 'Membership Renewal Reminder 🔄',
        message: `Hi ${user.firstName}! Your membership expires in ${daysDiff} days. Renew now to continue enjoying all benefits.`,
        timestamp: now.toISOString(),
        read: false,
        data: {
          expiryDate: user.membershipExpiry.toISOString(),
          daysLeft: daysDiff
        }
      })
    }
  }

  // 4. Welcome Messages for New Users
  const userCreated = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, firstName: true }
  })

  if (userCreated) {
    const daysSinceJoined = Math.floor((now.getTime() - userCreated.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceJoined <= 3) {
      notifications.push({
        id: `welcome-${userId}`,
        type: 'welcome',
        title: 'Welcome to JTM Community! 🎉',
        message: `Hi ${userCreated.firstName}! Welcome to our community. Explore upcoming events and connect with fellow members.`,
        timestamp: userCreated.createdAt.toISOString(),
        read: false,
        data: {}
      })
    }
  }

  // Sort by timestamp (newest first) and limit to 20
  return notifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
}

export async function POST(request: NextRequest) {
  try {
    const { notificationId, action } = await request.json()
    
    if (action === 'mark_read') {
      // In a real app, you'd store notification read status in the database
      // For now, we'll just return success
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}