import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Super Admin
  const adminEmail = 'admin@jtm.org'
  const adminPassword = 'admin123'
  
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    // Create admin record
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN',
        isActive: true,
        year: new Date().getFullYear()
      }
    })
    console.log('✅ Admin record created:', admin.email)
  }

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingUser) {
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Create admin user for login
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'System',
        lastName: 'Administrator',
        mobileNumber: '1234567890',
        membershipType: 'INDIVIDUAL',
        isActive: true,
        password: hashedPassword,
        mustChangePassword: true,
        notifications: {
          create: {
            email: true,
            push: true,
            eventReminders: true,
            membershipRenewal: true,
            adminUpdates: true
          }
        }
      }
    })
    console.log('✅ Admin user created:', adminUser.email)
  }

  // Create sample regular users
  const users = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      mobileNumber: '5551234567',
      membershipType: 'FAMILY' as const,
      password: 'password123'
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      mobileNumber: '5559876543',
      membershipType: 'INDIVIDUAL' as const,
      password: 'password123'
    }
  ]

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mobileNumber: userData.mobileNumber,
          membershipType: userData.membershipType,
          isActive: true,
          password: hashedPassword,
          mustChangePassword: false,
          notifications: {
            create: {
              email: true,
              push: true,
              eventReminders: true,
              membershipRenewal: true,
              adminUpdates: false
            }
          }
        }
      })
      console.log('✅ Sample user created:', user.email)
    }
  }

  // Create sample events
  const events = [
    {
      title: 'Community Gathering 2025',
      description: 'Annual community gathering with food, games, and networking.',
      date: new Date('2025-11-15T18:00:00Z'),
      location: 'Community Center, Main Hall',
      rsvpRequired: true,
      rsvpDeadline: new Date('2025-11-10T23:59:59Z'),
      maxParticipants: 100
    },
    {
      title: 'Cultural Festival',
      description: 'Celebrate our rich cultural heritage with traditional music, dance, and food.',
      date: new Date('2025-12-20T16:00:00Z'),
      location: 'City Park Amphitheater',
      rsvpRequired: true,
      rsvpDeadline: new Date('2025-12-15T23:59:59Z'),
      maxParticipants: 200
    }
  ]

  for (const eventData of events) {
    const existingEvent = await prisma.event.findFirst({
      where: { title: eventData.title }
    })

    if (!existingEvent) {
      const event = await prisma.event.create({
        data: eventData
      })
      console.log('✅ Sample event created:', event.title)
    }
  }

  console.log('🎉 Seeding completed successfully!')
  console.log('')
  console.log('📧 Admin Login Details:')
  console.log('   Email: admin@jtm.org')
  console.log('   Password: admin123')
  console.log('   ⚠️  You must change the password on first login')
  console.log('')
  console.log('📧 Sample User Login Details:')
  console.log('   Email: john.doe@example.com')
  console.log('   Password: password123')
  console.log('')
  console.log('🌐 Access the application at: http://localhost:3000')
  console.log('🗄️  View database at: npx prisma studio')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })