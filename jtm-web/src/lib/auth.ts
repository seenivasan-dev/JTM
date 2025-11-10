/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// JTM Web - NextAuth.js Configuration
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            address: true,
            notifications: true,
          },
        })

        if (!user) {
          return null
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account is not active. Please contact admin.')
        }

        // Verify password - check both regular password and temp password (both are hashed)
        let isValidPassword = false;
        
        if (user.password) {
          isValidPassword = await bcrypt.compare(credentials.password, user.password);
        }
        
        // If regular password didn't match, try temp password
        if (!isValidPassword && user.tempPassword) {
          isValidPassword = await bcrypt.compare(credentials.password, user.tempPassword);
        }

        if (!isValidPassword) {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          membershipType: user.membershipType,
          isActive: user.isActive,
          mustChangePassword: user.mustChangePassword,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.membershipType = (user as any).membershipType
        token.isActive = (user as any).isActive
        token.mustChangePassword = (user as any).mustChangePassword
      }
      
      // Refresh user data from database on update trigger (e.g., after password change)
      if (trigger === 'update' && token.id) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            mustChangePassword: true,
            isActive: true,
          },
        })
        
        if (updatedUser) {
          token.mustChangePassword = updatedUser.mustChangePassword
          token.isActive = updatedUser.isActive
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).firstName = token.firstName
        ;(session.user as any).lastName = token.lastName
        ;(session.user as any).membershipType = token.membershipType
        ;(session.user as any).isActive = token.isActive
        ;(session.user as any).mustChangePassword = token.mustChangePassword
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
}