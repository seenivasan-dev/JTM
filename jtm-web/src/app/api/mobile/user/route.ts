// JTM Mobile - User Profile API
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For mobile authentication, we'll use email from query params
    // In production, you'd want proper JWT token authentication
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        address: true,
        familyMembers: true,
        notifications: true,
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email: userEmail },
    })

    // Return user data (excluding sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      membershipType: user.membershipType,
      membershipExpiry: user.membershipExpiry,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      lastLogin: user.lastLogin,
      address: user.address,
      familyMembers: user.familyMembers,
      notifications: user.notifications,
      isAdmin: !!admin
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching mobile user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, ...updateData } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        address: true,
        familyMembers: true,
        notifications: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        firstName: updateData.firstName || existingUser.firstName,
        lastName: updateData.lastName || existingUser.lastName,
        mobileNumber: updateData.mobileNumber || existingUser.mobileNumber,
        membershipType: updateData.membershipType || existingUser.membershipType,
        // Update address if provided
        address: updateData.address ? {
          upsert: {
            create: updateData.address,
            update: updateData.address,
          }
        } : undefined,
        // Update notifications if provided
        notifications: updateData.notifications ? {
          upsert: {
            create: updateData.notifications,
            update: updateData.notifications,
          }
        } : undefined,
      },
      include: {
        address: true,
        familyMembers: true,
        notifications: true,
      },
    })

    // Handle family members separately if provided
    if (updateData.familyMembers) {
      // Delete existing family members
      await prisma.familyMember.deleteMany({
        where: { userId: existingUser.id },
      })

      // Create new family members
      if (updateData.familyMembers.length > 0) {
        await prisma.familyMember.createMany({
          data: updateData.familyMembers.map((member: any) => ({
            ...member,
            userId: existingUser.id,
          })),
        })
      }
    }

    // Fetch the final updated user data
    const finalUser = await prisma.user.findUnique({
      where: { email },
      include: {
        address: true,
        familyMembers: true,
        notifications: true,
      },
    })

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    return NextResponse.json({
      ...finalUser,
      isAdmin: !!admin,
    })
  } catch (error) {
    console.error('Error updating mobile user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}