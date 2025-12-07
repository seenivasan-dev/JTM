// JTM Web - Admin Events Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminEventsView from '@/components/admin/AdminEventsView'

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  })

  if (!admin) {
    redirect('/member')
  }

  const adminInfo = {
    firstName: admin.firstName || 'Admin',
    lastName: admin.lastName || 'User',
    email: session.user.email,
    role: String(admin.role),
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
            nonVegMeals++
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
        responses: rsvp.responses as Record<string, unknown> || {},
        createdAt: rsvp.createdAt.toISOString(),
        updatedAt: rsvp.updatedAt.toISOString(),
        checkedInAt: rsvp.checkedInAt?.toISOString() || null,
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
    <Suspense fallback={<div className="p-8">Loading events management...</div>}>
      <AdminEventsView events={eventsWithStats} />
    </Suspense>
  )
}