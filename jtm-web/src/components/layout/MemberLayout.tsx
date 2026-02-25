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
  LogOut,
  Home,
  Menu,
  X,
  Sparkles,
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/',
      description: 'Return to landing page',
    },
    {
      name: 'Dashboard',
      href: '/member',
      icon: LayoutDashboard,
      current: pathname === '/member',
      description: 'Your member overview',
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      current: pathname.startsWith('/events'),
      description: 'Browse & RSVP for events',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile',
      description: 'Manage your profile',
    },
    {
      name: 'Renewal',
      href: '/renewal',
      icon: RefreshCcw,
      current: pathname === '/renewal',
      description: 'Renew your membership',
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
    isActive: true,
  }

  const initials = `${userInfo.firstName[0] || ''}${userInfo.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-72' : 'w-16'
          } transition-all duration-300 ease-in-out flex-shrink-0 hidden md:block`}
        >
          <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-xl">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              {sidebarOpen ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    JTM
                  </div>
                  <div className="ml-3">
                    <span className="block text-lg font-bold text-white">Member Portal</span>
                    <span className="block text-xs text-blue-100">Community Access</span>
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
                className="p-2 text-white hover:bg-white/20 rounded-lg"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        item.current
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md mr-3 flex-shrink-0 ${
                          item.current
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {sidebarOpen && (
                        <div className="min-w-0 flex-1">
                          <span className="block truncate">{item.name}</span>
                          {item.description && (
                            <span
                              className={`text-xs block truncate ${
                                item.current ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Tooltip for collapsed sidebar */}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 top-2 z-50 hidden group-hover:block pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                          {item.name}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Sidebar User Profile */}
            {sidebarOpen && (
              <div className="p-4 border-t border-gray-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {userInfo.firstName} {userInfo.lastName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize truncate">
                          {userInfo.membershipType} Member
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
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
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* White Top Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                {/* Toggle sidebar on desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden md:flex p-2 rounded-lg"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                {/* Mobile branding */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">JTM</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Member Portal</h2>
              </div>

              <div className="flex items-center space-x-3">
                {!userInfo.isActive && (
                  <Badge variant="destructive" className="animate-pulse hidden sm:flex">
                    Inactive
                  </Badge>
                )}

                {/* User avatar dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-600 text-white font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userInfo.firstName} {userInfo.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userInfo.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                          <Sparkles className="inline h-3 w-3 mr-1" />
                          {userInfo.membershipType} Member
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/member" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/events" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Events
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/renewal" className="cursor-pointer">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Renewal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="md:hidden flex border-t border-gray-100 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all ${
                      item.current
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-6 py-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
