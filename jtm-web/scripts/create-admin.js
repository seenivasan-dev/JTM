// Script to create an admin user
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@jtm.org' }
    })

    if (existingAdmin) {
      console.log('Admin already exists with email: admin@jtm.org')
      return
    }

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@jtm.org',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN',
        isActive: true,
        year: new Date().getFullYear()
      }
    })

    // Also create a corresponding user account for login
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@jtm.org',
        firstName: 'System',
        lastName: 'Administrator',
        mobileNumber: '1234567890',
        membershipType: 'INDIVIDUAL',
        isActive: true,
        password: hashedPassword,
        mustChangePassword: true // Force password change on first login
      }
    })

    console.log('✅ Admin created successfully!')
    console.log('📧 Email: admin@jtm.org')
    console.log('🔑 Password: admin123')
    console.log('⚠️  You must change the password on first login')
    
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()