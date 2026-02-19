// JTM Web - Mobile-First Glassmorphism Admin Layout
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
  LogOut,
  QrCode,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react'
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
      color: 'from-violet-500 to-purple-600',
      glow: 'shadow-purple-500/40',
    },
    {
      name: 'Members',
      href: '/admin/members',
      icon: Users,
      current: pathname.startsWith('/admin/members'),
      badge: stats?.pendingRenewals || 0,
      description: 'Manage Members',
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/40',
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: Calendar,
      current: pathname.startsWith('/admin/events'),
      badge: stats?.upcomingEvents || 0,
      description: 'Event Management',
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/40',
    },
    {
      name: 'QR Check-in',
      href: '/admin/qr-checkin',
      icon: QrCode,
      current: pathname.startsWith('/admin/qr-checkin'),
      description: 'QR Code System',
      color: 'from-orange-500 to-amber-500',
      glow: 'shadow-orange-500/40',
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname.startsWith('/admin/notifications'),
      badge: stats?.newMessages || 0,
      description: 'Announcements',
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/40',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/admin/analytics'),
      description: 'Reports & Insights',
      color: 'from-indigo-500 to-blue-600',
      glow: 'shadow-indigo-500/40',
    },
    {
      name: 'Bulk Import',
      href: '/admin/bulk-import',
      icon: UserPlus,
      current: pathname.startsWith('/admin/bulk-import'),
      description: 'Import Members',
      color: 'from-fuchsia-500 to-purple-600',
      glow: 'shadow-fuchsia-500/40',
    },
    {
      name: 'Renewals',
      href: '/admin/renewals',
      icon: RefreshCcw,
      current: pathname.startsWith('/admin/renewals'),
      description: 'Membership Renewals',
      color: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/40',
    },
  ]

  const bottomNav = navigation.slice(0, 4)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const NavigationDrawer = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Drawer Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="relative w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden shadow-xl">
            <Image
              src="/images/jtmlogo.png"
              alt="JTM Logo"
              width={52}
              height={52}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Jacksonville</h1>
            <p className="text-sm font-medium text-orange-400">Tamil Mandram</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-xs text-amber-400">Admin Portal</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Info */}
      {adminInfo && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <Avatar className="h-12 w-12 ring-2 ring-orange-400/50">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-600 text-white font-bold">
                {adminInfo.firstName[0]}{adminInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {adminInfo.firstName} {adminInfo.lastName}
              </p>
              <p className="text-xs text-slate-400 capitalize truncate">
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
                flex items-center justify-between px-4 py-3 rounded-2xl
                transition-all duration-200
                ${item.current
                  ? `bg-gradient-to-r ${item.color} shadow-lg ${item.glow} text-white`
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${item.current ? 'bg-white/20' : 'bg-white/5'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className={`text-xs ${item.current ? 'text-white/70' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
              {item.badge && item.badge > 0 ? (
                <Badge className={item.current ? 'bg-white/20 text-white border-0' : 'bg-orange-500 text-white border-0'}>
                  {item.badge}
                </Badge>
              ) : (
                <ChevronRight className="h-4 w-4 opacity-30" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/admin/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <div className="p-2 rounded-xl bg-white/5">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <div className="p-2 rounded-xl bg-red-500/10">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── TOP HEADER ── Glassy Gradient Banner */}
      <header className="sticky top-0 z-50">

        {/* Main Header Row */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a4e 100%)',
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-4 right-20 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-1/2 w-40 h-10 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative flex items-center justify-between px-4 py-3">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center space-x-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 border-0">
                  <NavigationDrawer />
                </SheetContent>
              </Sheet>

              <Link href="/admin" className="flex items-center space-x-2.5">
                <div className="relative w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl border border-white/25 flex items-center justify-center overflow-hidden shadow-lg">
                  <Image
                    src="/images/jtmlogo.png"
                    alt="JTM Logo"
                    width={34}
                    height={34}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white leading-tight">
                    JTM Admin
                  </h1>
                  <p className="text-xs text-orange-300/80 leading-tight">Management Portal</p>
                </div>
              </Link>
            </div>

            {/* Right: Bell + Profile */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Link
                href="/admin/notifications"
                className="relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <Bell className="h-5 w-5" />
                {stats?.newMessages && stats.newMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {stats.newMessages}
                  </span>
                )}
              </Link>

              {/* Profile */}
              {adminInfo && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 pl-1 pr-2 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                      <Avatar className="h-7 w-7 ring-2 ring-orange-400/60">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-600 text-white font-bold text-xs">
                          {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-xs font-medium text-white/90">
                        {adminInfo.firstName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2">
                    <DropdownMenuLabel>
                      <div className="flex items-center space-x-3 p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                        <Avatar className="h-10 w-10 ring-2 ring-purple-400/40">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-600 text-white font-bold">
                            {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {adminInfo.firstName} {adminInfo.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{adminInfo.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Quick Nav Sub-bar */}
        <div
          className="hidden lg:flex items-center gap-1 px-4 py-2 overflow-x-auto border-b border-white/10"
          style={{ background: 'linear-gradient(135deg, #1a1740 0%, #2d2a6e 100%)' }}
        >
          {navigation.slice(0, 6).map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.current
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-130px)] pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* ── BOTTOM NAV ── Glassy Gradient Bar (Mobile Only) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Decorative glow line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(236,72,153,0.8), rgba(249,115,22,0.8), transparent)' }}
        />

        <div className="flex items-center justify-around px-2 py-2">
          {bottomNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center flex-1 py-1.5 group"
              >
                <div
                  className={`
                    relative flex items-center justify-center w-11 h-9 rounded-xl transition-all duration-200
                    ${item.current
                      ? `bg-gradient-to-br ${item.color} shadow-lg ${item.glow}`
                      : 'bg-white/5 group-hover:bg-white/15'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${item.current ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-1 font-medium transition-colors
                    ${item.current ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                  `}
                >
                  {item.name}
                </span>
                {/* Active dot indicator */}
                {item.current && (
                  <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${item.color} mt-0.5 shadow-sm`} />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
