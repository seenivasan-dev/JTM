// Script to reset a user's password
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword(email: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const user = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        mustChangePassword: true // Force password change on next login
      },
    })
    
    console.log(`✅ Password reset successfully for: ${user.email}`)
    console.log(`New password: ${newPassword}`)
    console.log(`User will be required to change password on next login.`)
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Usage: tsx scripts/reset-password.ts
const email = process.argv[2] || 'seenivasn@gmail.com'
const newPassword = process.argv[3] || 'TempPass123!'

resetPassword(email, newPassword)
