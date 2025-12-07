// JTM Web - Modern Tamil-Inspired Admin Layout
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Sun,
  Moon,
  Sparkles,
  Home,
  Clock
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

export default function AdminLayout({ children, adminInfo, stats }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Changed to false by default - mobile first
  const [darkMode, setDarkMode] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin',
      description: 'Overview & Analytics',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      name: 'Members',
      href: '/admin/members',
      icon: Users,
      current: pathname.startsWith('/admin/members'),
      badge: stats?.pendingRenewals || 0,
      description: 'Community Members',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: Calendar,
      current: pathname.startsWith('/admin/events'),
      badge: stats?.upcomingEvents || 0,
      description: 'Tamil Celebrations',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname.startsWith('/admin/notifications'),
      badge: stats?.newMessages || 0,
      description: 'Announcements',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/admin/analytics'),
      description: 'Reports & Insights',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Bulk Import',
      href: '/admin/bulk-import',
      icon: UserPlus,
      current: pathname.startsWith('/admin/bulk-import'),
      description: 'Import Members',
      gradient: 'from-rose-500 to-orange-500'
    },
    {
      name: 'Renewals',
      href: '/admin/renewals',
      icon: RefreshCcw,
      current: pathname.startsWith('/admin/renewals'),
      description: 'Membership Renewals',
      gradient: 'from-amber-500 to-yellow-500'
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Modern Sidebar with Tamil Cultural Design */}
        <div 
          className={`${
            sidebarOpen ? 'w-72' : 'w-20'
          } transition-all duration-300 ease-in-out relative`}
        >
          <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl relative overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-kolam-pattern"></div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Logo Section */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  {sidebarOpen ? (
                    <Link href="/admin" className="flex items-center space-x-3 group">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-xl">JTM</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">
                          Jacksonville
                        </h1>
                        <p className="text-sm text-orange-400 font-medium">
                          Tamil Mandram
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                      <span className="text-white font-bold text-xl">JTM</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-white hover:bg-white/10 rounded-xl p-2"
                  >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group relative flex items-center px-3 py-3.5 rounded-2xl
                        transition-all duration-300 ease-out
                        ${item.current
                          ? `bg-gradient-to-r ${item.gradient} shadow-lg shadow-primary/30 text-white`
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      {/* Active Indicator */}
                      {item.current && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                      )}
                      
                      <div className={`
                        p-2.5 rounded-xl mr-3 transition-all duration-300
                        ${item.current 
                          ? 'bg-white/20 shadow-lg' 
                          : 'bg-white/5 group-hover:bg-white/10'
                        }
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <p className={`text-xs truncate ${
                                item.current ? 'text-white/80' : 'text-gray-400'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            {item.badge && item.badge > 0 && (
                              <Badge 
                                className={`
                                  ml-2 font-semibold
                                  ${item.current 
                                    ? 'bg-white text-primary' 
                                    : 'bg-primary text-white animate-badge-pulse'
                                  }
                                `}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {!sidebarOpen && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {item.name}
                          {item.badge && item.badge > 0 && (
                            <Badge className="ml-2 bg-primary text-white">{item.badge}</Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* User Profile in Sidebar */}
              {sidebarOpen && adminInfo && (
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                    <Avatar className="h-11 w-11 ring-2 ring-primary/50">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-base">
                        {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {adminInfo.firstName} {adminInfo.lastName}
                      </p>
                      <p className="text-xs text-gray-400 capitalize truncate">
                        {adminInfo.role} Admin
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md sticky top-0 z-[100]">
            <div className="flex items-center justify-between px-6 py-3">
              {/* Left Section - Logo & Menu Toggle */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hover:bg-muted rounded-lg p-2"
                >
                  <Menu className="h-6 w-6" />
                </Button>
                
                {/* Logo */}
                <Link href="/admin" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">JTM</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Jacksonville Tamil Mandram
                    </h1>
                    <p className="text-xs text-muted-foreground">Admin Portal</p>
                  </div>
                </Link>
              </div>

              {/* Center - Horizontal Menu (Desktop) */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link href="/admin">
                  <Button variant={pathname === '/admin' ? 'default' : 'ghost'} size="sm" className="rounded-lg">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/members">
                  <Button variant={pathname.startsWith('/admin/members') ? 'default' : 'ghost'} size="sm" className="rounded-lg">
                    <Users className="h-4 w-4 mr-2" />
                    Members
                    {stats?.pendingRenewals && stats.pendingRenewals > 0 && (
                      <Badge className="ml-2 h-5 px-1.5 text-xs">{stats.pendingRenewals}</Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/events">
                  <Button variant={pathname.startsWith('/admin/events') ? 'default' : 'ghost'} size="sm" className="rounded-lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                    {stats?.upcomingEvents && stats.upcomingEvents > 0 && (
                      <Badge className="ml-2 h-5 px-1.5 text-xs">{stats.upcomingEvents}</Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant={pathname.startsWith('/admin/analytics') ? 'default' : 'ghost'} size="sm" className="rounded-lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/admin/renewals">
                  <Button variant={pathname.startsWith('/admin/renewals') ? 'default' : 'ghost'} size="sm" className="rounded-lg">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Renewals
                  </Button>
                </Link>
              </nav>

              {/* Right Section - Actions & Profile */}
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button variant="ghost" size="sm" asChild className="relative rounded-lg hover:bg-muted">
                  <Link href="/admin/notifications">
                    <Bell className="h-5 w-5" />
                    {stats?.newMessages && stats.newMessages > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {stats.newMessages}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-lg hover:bg-muted hidden sm:flex"
                >
                  {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
                </Button>

                {/* User Profile Dropdown */}
                {adminInfo && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative rounded-lg hover:bg-muted px-2 py-1.5">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                              {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold leading-none">
                              {adminInfo.firstName} {adminInfo.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {adminInfo.role}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-2">
                      <DropdownMenuLabel>
                        <div className="flex items-center space-x-3 p-2 bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg">
                              {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {adminInfo.firstName} {adminInfo.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {adminInfo.email}
                            </p>
                            <Badge className="mt-1 capitalize text-xs bg-primary/10 text-primary border-primary/20">
                              {adminInfo.role} Admin
                            </Badge>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Home className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/members" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          Members
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/events" className="cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          Events
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/analytics" className="cursor-pointer">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleSignOut} 
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
