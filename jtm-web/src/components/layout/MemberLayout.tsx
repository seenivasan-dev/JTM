'use client'

import React from 'react'
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
  Sparkles,
  ChevronDown
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
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/',
    },
    {
      name: 'Dashboard',
      href: '/member',
      icon: LayoutDashboard,
      current: pathname === '/member',
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      current: pathname.startsWith('/events'),
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: pathname === '/profile',
    },
    {
      name: 'Renewal',
      href: '/renewal',
      icon: RefreshCcw,
      current: pathname === '/renewal',
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

  const initials = `${userInfo.firstName[0] || ''}${userInfo.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header with Tamil Cultural Design - Enhanced */}
      <header className="sticky top-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Branding */}
            <Link href="/member" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">JTM</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-base font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Jacksonville Tamil Mandram
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Member Portal</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <Button
                      variant={item.current ? 'default' : 'ghost'}
                      size="sm"
                      className={`
                        rounded-lg transition-all duration-200
                        ${item.current 
                          ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-md' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {!userInfo.isActive && (
                <Badge variant="destructive" className="animate-pulse hidden sm:flex">
                  Inactive
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ring-2 ring-orange-500/20">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-blue-500 text-white text-sm font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {userInfo.firstName}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {userInfo.membershipType}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3 p-2 bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                      <Avatar className="h-12 w-12 ring-2 ring-orange-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-blue-500 text-white font-bold text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {userInfo.firstName} {userInfo.lastName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {userInfo.email}
                        </p>
                        <Badge className="mt-1 capitalize text-xs bg-gradient-to-r from-orange-500 to-blue-500 text-white border-0">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {userInfo.membershipType} Member
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/member" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
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
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex items-center gap-2 overflow-x-auto pb-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <Button
                      variant={item.current ? 'default' : 'ghost'}
                      size="sm"
                      className={`
                        whitespace-nowrap rounded-lg transition-all
                        ${item.current 
                          ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-md' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JTM</span>
              </div>
              <span className="font-semibold text-gray-900">Jacksonville Tamil Mandram</span>
            </div>
            <p className="text-sm text-gray-600">
              Connecting Tamil families in Jacksonville, Florida
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © {new Date().getFullYear()} JTM Community. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}