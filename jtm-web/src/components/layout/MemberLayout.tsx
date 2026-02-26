'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
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
  ChevronDown,
  Scale,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    { name: 'Home', href: '/', icon: Home, current: pathname === '/' },
    { name: 'Dashboard', href: '/member', icon: LayoutDashboard, current: pathname === '/member' },
    { name: 'Events', href: '/events', icon: Calendar, current: pathname.startsWith('/events') },
    { name: 'ByLaws', href: '/bylaws', icon: Scale, current: pathname === '/bylaws' },
    { name: 'Profile', href: '/profile', icon: User, current: pathname === '/profile' },
    { name: 'Renewal', href: '/renewal', icon: RefreshCcw, current: pathname === '/renewal' },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Top Navigation — matches landing page nav */}
      <nav className="fixed top-0 w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 shadow-xl z-50">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform ring-2 ring-white/30 flex-shrink-0">
                <Image
                  src="/images/JTMLogo.jpg"
                  alt="Jacksonville Tamil Mandram"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white drop-shadow">Jacksonville Tamil Mandram</h1>
                <p className="text-sm text-white/70">Member Portal</p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      item.current
                        ? 'bg-white/25 backdrop-blur-sm text-white font-semibold shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Right: badge + avatar dropdown */}
            <div className="flex items-center gap-3">
              {!userInfo.isActive && (
                <Badge variant="destructive" className="animate-pulse hidden sm:flex">
                  Inactive
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-white hover:bg-white/15 px-3 py-2 h-auto rounded-xl"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-white/20 text-white font-semibold border border-white/30">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-white leading-tight">
                        {userInfo.firstName} {userInfo.lastName}
                      </div>
                      <div className="text-xs text-white/70 capitalize leading-tight">
                        {userInfo.membershipType} Member
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/70 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userInfo.firstName} {userInfo.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
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
                    <Link href="/bylaws" className="cursor-pointer">
                      <Scale className="mr-2 h-4 w-4" />
                      ByLaws
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

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 hover:bg-white/15 rounded-lg text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-b from-blue-700 to-indigo-700 border-t border-white/20">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      item.current
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              <div className="pt-2 border-t border-white/20">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content — padded below fixed nav */}
      <main className="pt-20 min-h-screen">
        <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
