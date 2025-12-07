// JTM Web - Login API Route
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        address: true,
        notifications: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check if user is active
    // Note: We allow expired members to login so they can renew
    // The dashboard will redirect them to renewal page
    const isExpired = !user.isActive;
    
    // Only block users who were never activated (not just expired)
    if (!user.isActive && !user.membershipExpiry) {
      return NextResponse.json(
        { success: false, error: 'Account is not active. Please contact admin for activation.' },
        { status: 403 }
      )
    }
    
    // Verify password - check both regular password and temp password (both are hashed)
    let isValidPassword = false;
    
    if (user.password) {
      isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    }
    
    // If regular password didn't match, try temp password
    if (!isValidPassword && user.tempPassword) {
      isValidPassword = await bcrypt.compare(validatedData.password, user.tempPassword);
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })
    
    // Return user data (excluding sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      membershipType: user.membershipType,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      membershipExpiry: user.membershipExpiry,
      address: user.address,
      notifications: user.notifications,
    }

    // Determine appropriate message
    let message = 'Login successful';
    if (user.mustChangePassword) {
      message = 'Login successful. Please change your password.';
    } else if (isExpired) {
      message = 'Your membership has expired. Please renew to continue accessing all features.';
    }

    return NextResponse.json({
      success: true,
      data: { user: userData },
      message,
      requiresRenewal: isExpired, // Flag for client-side redirect
    })  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}