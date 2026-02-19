// JTM Web - Mobile-First Professional Admin Layout
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  BarChart3,
  UserPlus,
  RefreshCcw,
  Menu,
  X,
  LogOut,
  QrCode,
  Settings,
  ChevronRight
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { signOut } from 'next-auth/react'

interface AdminLayoutProps {
  children: React.ReactNode
  adminInfo?: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  stats?: {
    pendingRenewals?: number
    newMessages?: number
    upcomingEvents?: number
  }
}

export default function AdminLayoutMobile({ children, adminInfo, stats }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin',
      description: 'Overview & Analytics',
    },
    {
      name: 'Members',
      href: '/admin/members',
      icon: Users,
      current: pathname.startsWith('/admin/members'),
      badge: stats?.pendingRenewals || 0,
      description: 'Manage Members',
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: Calendar,
      current: pathname.startsWith('/admin/events'),
      badge: stats?.upcomingEvents || 0,
      description: 'Event Management',
    },
    {
      name: 'QR Check-in',
      href: '/admin/qr-checkin',
      icon: QrCode,
      current: pathname.startsWith('/admin/qr-checkin'),
      description: 'QR Code System',
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname.startsWith('/admin/notifications'),
      badge: stats?.newMessages || 0,
      description: 'Announcements',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/admin/analytics'),
      description: 'Reports & Insights',
    },
    {
      name: 'Bulk Import',
      href: '/admin/bulk-import',
      icon: UserPlus,
      current: pathname.startsWith('/admin/bulk-import'),
      description: 'Import Members',
    },
    {
      name: 'Renewals',
      href: '/admin/renewals',
      icon: RefreshCcw,
      current: pathname.startsWith('/admin/renewals'),
      description: 'Membership Renewals',
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  // Mobile Navigation Drawer Content
  const NavigationDrawer = () => (
    <div className="flex flex-col h-full">
      {/* Drawer Header */}
      <div className="p-6 border-b bg-gradient-to-br from-orange-50 to-blue-50">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="relative w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden">
            <Image
              src="/images/jtmlogo.png"
              alt="JTM Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Jacksonville</h1>
            <p className="text-sm font-medium text-orange-600">Tamil Mandram</p>
          </div>
        </Link>
      </div>

      {/* Admin Info */}
      {adminInfo && (
        <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-500/30">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-blue-600 text-white font-bold">
                {adminInfo.firstName[0]}{adminInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {adminInfo.firstName} {adminInfo.lastName}
              </p>
              <p className="text-xs text-gray-600 capitalize truncate">
                {adminInfo.role} Admin
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl
                transition-all duration-200
                ${item.current
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className={`text-xs ${item.current ? 'text-white/80' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
              {item.badge && item.badge > 0 ? (
                <Badge className={item.current ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}>
                  {item.badge}
                </Badge>
              ) : (
                <ChevronRight className="h-4 w-4 opacity-40" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Drawer Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          asChild
        >
          <Link href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Mobile-First Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Menu + Logo */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 rounded-xl"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <NavigationDrawer />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="relative w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/jtmlogo.png"
                  alt="JTM Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                  JTM Admin
                </h1>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            </Link>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative hover:bg-gray-100 rounded-xl"
            >
              <Link href="/admin/notifications">
                <Bell className="h-5 w-5" />
                {stats?.newMessages && stats.newMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {stats.newMessages}
                  </span>
                )}
              </Link>
            </Button>

            {/* Profile Dropdown */}
            {adminInfo && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-gray-100 rounded-xl px-2">
                    <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-blue-600 text-white font-bold text-sm">
                        {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3 p-2">
                      <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-blue-600 text-white font-bold">
                          {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {adminInfo.firstName} {adminInfo.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {adminInfo.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Desktop Quick Nav (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-1 px-4 py-2 bg-gray-50 border-t overflow-x-auto">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? 'default' : 'ghost'}
                  size="sm"
                  className="whitespace-nowrap rounded-lg"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <Badge className="ml-2 h-5 px-1.5">{item.badge}</Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Quick Access (Optional) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex items-center justify-around py-2">
          {[navigation[0], navigation[1], navigation[2], navigation[3]].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                  item.current
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
