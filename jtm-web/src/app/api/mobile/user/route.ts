// JTM Web - Mobile User Info API Route (for testing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For testing purposes, return a mock user
    // In production, you'd implement proper JWT authentication
    
    const mockUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      membershipType: 'INDIVIDUAL',
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true,
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      familyMembers: [],
      notifications: {
        email: true,
        push: true,
        eventReminders: true,
        membershipRenewal: true,
        adminUpdates: false
      },
      isAdmin: false
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    console.error('Error fetching mobile user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}