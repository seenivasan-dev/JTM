import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get admin, but allow creation even without admin record
    let adminId = 'system'
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email || '' }
      })
      if (admin) {
        adminId = admin.id
      }
    } catch (error) {
      console.warn('Admin lookup failed, using system ID:', error)
    }

    const body = await request.json()
    const { title, date, time, location, description, maxAttendees } = body

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Title, date, and location are required' }, { status: 400 })
    }

    // Create standalone check-in event
    const event = await prisma.checkInEvent.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        time: time || '',
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        createdBy: adminId
      }
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location
      }
    })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 500 }
    )
  }
}
