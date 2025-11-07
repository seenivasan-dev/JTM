// JTM Web - Registration API Route
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { memberRegistrationSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = memberRegistrationSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    
    // Create user with address and family members in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          mobileNumber: validatedData.mobileNumber,
          membershipType: validatedData.membershipType,
          tempPassword,
          mustChangePassword: true,
          isActive: false, // Admin needs to activate
          importedFromExcel: false,
          // Payment information
          initialPaymentMethod: body.paymentMethod || null,
          initialPaymentConfirmation: body.paymentConfirmation || null,
        },
      })
      
      // Create address
      await tx.address.create({
        data: {
          ...validatedData.address,
          userId: user.id,
        },
      })
      
      // Create family members if provided
      if (validatedData.familyMembers && validatedData.familyMembers.length > 0) {
        await tx.familyMember.createMany({
          data: validatedData.familyMembers.map(member => ({
            ...member,
            userId: user.id,
          })),
        })
      }
      
      // Create default notification preferences
      await tx.notificationPreferences.create({
        data: {
          userId: user.id,
          email: true,
          push: true,
          eventReminders: true,
          membershipRenewal: true,
          adminUpdates: true,
        },
      })
      
      return user
    })
    
    // TODO: Send email with temporary password
    // This would be implemented with your email service (Resend/SendGrid)
    console.log(`Temporary password for ${result.email}: ${tempPassword}`)
    
    return NextResponse.json({
      success: true,
      data: { 
        userId: result.id,
        message: 'Registration successful. Please check your email for login credentials.',
      },
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    
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