// JTM Web - Unified Events Page (User + Admin)
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventLayout from '@/components/layout/EventLayout'
import AdminLayout from '@/components/admin/AdminLayout'
import EventsClient from '@/components/events/EventsClient'
import AdminEventManagement from '@/components/admin/AdminEventManagement'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user data and admin status
  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      membershipType: true,
    },
  })

  if (!userData) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: userData.email },
  })

  const isAdmin = !!admin

  if (isAdmin) {
    // Admin View: Show comprehensive event management
    const adminInfo = {
      firstName: userData.firstName || 'Admin',
      lastName: userData.lastName || 'User',
      email: session.user.email,
      role: String(admin!.role),
    }

    // Get all events with detailed RSVP information for admin
    const events = await prisma.event.findMany({
      orderBy: [{ date: 'desc' }],
      include: {
        rsvpResponses: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                membershipType: true,
                familyMembers: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    age: true,
                    relationship: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            rsvpResponses: true,
          }
        }
      }
    })

    // Process events with stats for admin view
    const eventsWithStats = events.map(event => {
      const rsvps = event.rsvpResponses
      const totalRSVPs = rsvps.length
      const checkedIn = rsvps.filter(r => r.checkedIn).length
      const pending = rsvps.filter(r => !r.checkedIn).length
      
      // Food preference analytics
      let totalMeals = 0
      let vegMeals = 0
      let nonVegMeals = 0
      let kidsMeals = 0
      let adultMeals = 0
      
      rsvps.forEach(rsvp => {
        if (rsvp.responses && typeof rsvp.responses === 'object') {
          const responses = rsvp.responses as Record<string, unknown>
          
          if (responses.foodPreference) {
            totalMeals++
            adultMeals++
            if (responses.foodPreference === 'vegetarian' || responses.foodPreference === 'veg') {
              vegMeals++
            } else if (responses.foodPreference === 'non-vegetarian' || responses.foodPreference === 'non-veg') {
              nonVegMeals++
            }
          }
          
          if (responses.familyAttending && Array.isArray(responses.familyAttending)) {
            responses.familyAttending.forEach((familyMember: Record<string, unknown>) => {
              if (familyMember.attending) {
                totalMeals++
                const age = (familyMember.age as number) || 0
                if (age < 12) {
                  kidsMeals++
                } else {
                  adultMeals++
                }
                
                if (familyMember.foodPreference === 'vegetarian' || familyMember.foodPreference === 'veg') {
                  vegMeals++
                } else if (familyMember.foodPreference === 'non-vegetarian' || familyMember.foodPreference === 'non-veg') {
                  nonVegMeals++
                }
              }
            })
          }
          
          if (responses.guestCount && typeof responses.guestCount === 'number') {
            totalMeals += responses.guestCount
            adultMeals += responses.guestCount
            if (responses.guestFoodPreference === 'vegetarian' || responses.guestFoodPreference === 'veg') {
              vegMeals += responses.guestCount
            } else if (responses.guestFoodPreference === 'non-vegetarian' || responses.guestFoodPreference === 'non-veg') {
              nonVegMeals += responses.guestCount
            }
          }
        }
      })

      return {
        ...event,
        date: event.date.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        rsvpDeadline: event.rsvpDeadline?.toISOString() || null,
        rsvpForm: event.rsvpForm as Record<string, unknown> | undefined,
        rsvpResponses: event.rsvpResponses.map(rsvp => ({
          ...rsvp,
          createdAt: rsvp.createdAt.toISOString(),
          updatedAt: rsvp.updatedAt.toISOString(),
        })),
        stats: {
          totalRSVPs,
          checkedIn,
          pending,
          totalMeals,
          vegMeals,
          nonVegMeals,
          kidsMeals,
          adultMeals,
          isActive: new Date(event.date) >= new Date(),
          isUpcoming: new Date(event.date) > new Date(),
          isPast: new Date(event.date) < new Date()
        }
      }
    })

    return (
      <AdminLayout adminInfo={adminInfo}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600 mt-1">Manage all community events and track attendance</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-600 font-medium">Admin View</span>
            </div>
          </div>
          <Suspense fallback={<div>Loading events management...</div>}>
            <AdminEventManagement events={eventsWithStats} />
          </Suspense>
        </div>
      </AdminLayout>
    )
  } else {
    // User View: Show events for browsing and RSVP
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date(), // Only future events for users
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        _count: {
          select: {
            rsvpResponses: true,
          }
        }
      }
    })

    // Serialize events for user view
    const serializedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      flyer: event.flyer,
      date: event.date.toISOString(),
      location: event.location,
      rsvpRequired: event.rsvpRequired,
      rsvpDeadline: event.rsvpDeadline?.toISOString() || null,
      maxParticipants: event.maxParticipants,
      rsvpForm: event.rsvpForm as { fields: { id: string; type: string; label: string; required: boolean; options?: string[] }[] } | null,
      currentAttendees: event._count.rsvpResponses,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }))

    return (
      <EventLayout 
        userRole="member"
        title="Community Events"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Events</h1>
              <p className="text-gray-600 mt-1">Discover and RSVP to upcoming community events</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-600 font-medium">Member View</span>
            </div>
          </div>
          <Suspense fallback={<div>Loading events...</div>}>
            <EventsClient 
              initialEvents={serializedEvents} 
              user={{ ...userData, isAdmin: false }}
            />
          </Suspense>
        </div>
      </EventLayout>
    )
  }
}