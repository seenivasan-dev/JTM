// JTM Web - Mobile Events API Route (for testing)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock events data for testing
    const mockEvents = {
      events: [
        {
          id: '1',
          title: 'Temple Festival',
          description: 'Annual temple festival celebration with cultural programs',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          location: 'Main Temple Hall',
          type: 'FESTIVAL',
          maxAttendees: 200,
          currentAttendees: 45
        },
        {
          id: '2',
          title: 'Community Lunch',
          description: 'Monthly community lunch for all members',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          location: 'Community Kitchen',
          type: 'SOCIAL',
          maxAttendees: 100,
          currentAttendees: 23
        },
        {
          id: '3',
          title: 'Yoga Class',
          description: 'Weekly yoga and meditation session',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          location: 'Meditation Hall',
          type: 'WELLNESS',
          maxAttendees: 30,
          currentAttendees: 12
        }
      ]
    }

    return NextResponse.json(mockEvents)
  } catch (error) {
    console.error('Error fetching mobile events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}