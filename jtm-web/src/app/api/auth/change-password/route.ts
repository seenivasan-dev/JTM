// JTM Web - Password Change API Route
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { passwordChangeSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body // This would come from session/auth middleware
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validate input
    const validatedData = passwordChangeSchema.parse(body)
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // If user has existing password, verify current password
    if (user.password && validatedData.currentPassword) {
      const isValidCurrentPassword = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      )
      
      if (!isValidCurrentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12)
    
    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        tempPassword: null, // Clear temporary password
        mustChangePassword: false,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
    
  } catch (error) {
    console.error('Password change error:', error)
    
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