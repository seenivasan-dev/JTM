'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  RefreshCcw,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MemberLayoutProps {
  children: React.ReactNode
  user?: {
    firstName: string
    lastName: string
    email: string
    membershipType: string
    isActive: boolean
  }
}

export default function MemberLayout({ children, user }: MemberLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/member',
      icon: LayoutDashboard,
      current: pathname === '/member',
      description: 'Overview and recent activity'
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      current: pathname.startsWith('/events'),
      description: 'Browse and join events'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile',
      description: 'Manage your information'
    },
    {
      name: 'Renewal',
      href: '/renewal',
      icon: RefreshCcw,
      current: pathname === '/renewal',
      description: 'Membership renewal'
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const userInfo = user || {
    firstName: session?.user?.name?.split(' ')[0] || 'Member',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
    membershipType: 'member',
    isActive: true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              {sidebarOpen ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    JTM
                  </div>
                  <div className="ml-3">
                    <span className="block text-lg font-bold text-white">
                      JTM Community
                    </span>
                    <span className="block text-xs text-blue-100">
                      Member Portal
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  JTM
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/20"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${item.current 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && (
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User Profile */}
            {sidebarOpen && (
              <div className="p-4 border-t border-gray-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>
                          {userInfo.firstName[0]}{userInfo.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {userInfo.firstName} {userInfo.lastName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {userInfo.membershipType} Member
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div>
                        <p className="text-sm font-medium">{userInfo.firstName} {userInfo.lastName}</p>
                        <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header - Simplified */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-2"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  JTM Community
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                {!userInfo.isActive && (
                  <Badge variant="destructive" className="animate-pulse">
                    Account Inactive
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-8 py-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}