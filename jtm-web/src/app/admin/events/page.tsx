// JTM Web - Admin Events Management Page
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminEventManagement from '@/components/admin/AdminEventManagement'

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
    redirect('/events') // Redirect non-admin users
  }

  // Get all events with detailed RSVP information
  const events = await prisma.event.findMany({
    orderBy: [
      { date: 'desc' }
    ],
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

  // Process events to add computed fields
  const eventsWithStats = events.map(event => {
    const rsvps = event.rsvpResponses
    const totalRSVPs = rsvps.length
    const checkedIn = rsvps.filter(r => r.checkedIn).length
    const pending = rsvps.filter(r => !r.checkedIn).length
    
    // Analyze food preferences from RSVP responses
    let totalMeals = 0
    let vegMeals = 0
    let nonVegMeals = 0
    let kidsMeals = 0
    let adultMeals = 0
    
    rsvps.forEach(rsvp => {
      if (rsvp.responses && typeof rsvp.responses === 'object') {
        const responses = rsvp.responses as Record<string, unknown>
        
        // Count main attendee
        if (responses.foodPreference) {
          totalMeals++
          adultMeals++
          if (responses.foodPreference === 'vegetarian' || responses.foodPreference === 'veg') {
            vegMeals++
          } else if (responses.foodPreference === 'non-vegetarian' || responses.foodPreference === 'non-veg') {
            nonVegMeals++
          }
        }
        
        // Count family members if attending
        if (responses.familyAttending && Array.isArray(responses.familyAttending)) {
          responses.familyAttending.forEach((familyMember: Record<string, unknown>) => {
            if (familyMember.attending) {
              totalMeals++
              
              // Determine if child or adult based on age
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
        
        // Count additional guests
        if (responses.guestCount && typeof responses.guestCount === 'number') {
          totalMeals += responses.guestCount
          adultMeals += responses.guestCount
          // Default guest food preference handling
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
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Management</h1>
        <Suspense fallback={<div>Loading events management...</div>}>
          <AdminEventManagement events={eventsWithStats} />
        </Suspense>
      </div>
    </AdminLayout>
  )
}