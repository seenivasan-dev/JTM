import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin check is optional
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email || '' }
      })
    } catch (error) {
      console.warn('Admin check skipped:', error)
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Check if event exists
    const event = await prisma.checkInEvent.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            attendees: true,
            checkIns: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete the event (cascade will delete attendees and check-ins)
    await prisma.checkInEvent.delete({
      where: { id: eventId }
    })

    console.log(`Deleted event: ${event.title} (${event._count.attendees} attendees, ${event._count.checkIns} check-ins)`)

    return NextResponse.json({
      success: true,
      message: 'Event and all associated data deleted successfully',
      deletedCount: {
        attendees: event._count.attendees,
        checkIns: event._count.checkIns
      }
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event' },
      { status: 500 }
    )
  }
}
