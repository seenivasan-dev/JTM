// JTM Web - Admin Layout Component
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
  Download,
  Menu,
  X,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin',
      description: 'Overview & key metrics'
    },
    {
      name: 'User Management',
      href: '/admin/members',
      icon: Users,
      current: pathname.startsWith('/admin/members'),
      badge: stats?.pendingRenewals || 0,
      description: 'Manage member accounts'
    },
    {
      name: 'Event Management',
      href: '/admin/events',
      icon: Calendar,
      current: pathname.startsWith('/admin/events'),
      badge: stats?.upcomingEvents || 0,
      description: 'Create & manage events'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname.startsWith('/admin/notifications'),
      badge: stats?.newMessages || 0,
      description: 'Send announcements'
    },
    {
      name: 'Analytics & Reports',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/admin/analytics'),
      description: 'Insights & reporting'
    },
    {
      name: 'Bulk Import',
      href: '/admin/bulk-import',
      icon: UserPlus,
      current: pathname.startsWith('/admin/bulk-import'),
      description: 'Import user data'
    },
    {
      name: 'Renewals',
      href: '/admin/renewals',
      icon: RefreshCcw,
      current: pathname.startsWith('/admin/renewals'),
      description: 'Process renewals'
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl">
            {/* Enhanced Logo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
              {sidebarOpen ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    JTM
                  </div>
                  <div className="ml-3">
                    <span className="block text-lg font-bold text-white">
                      Admin Portal
                    </span>
                    <span className="block text-xs text-blue-100">
                      Community Management
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
                className="p-2 text-white hover:bg-white/20 rounded-lg"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        item.current
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`p-2 rounded-md mr-3 ${
                          item.current 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                        }`}>
                          <Icon className="h-4 w-4 flex-shrink-0" />
                        </div>
                        {sidebarOpen && (
                          <div className="min-w-0 flex-1">
                            <span className="block truncate">{item.name}</span>
                            {item.description && (
                              <span className={`text-xs block truncate ${
                                item.current 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {item.description}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {sidebarOpen && item.badge && item.badge > 0 && (
                        <Badge 
                          variant={item.current ? "secondary" : "destructive"} 
                          className="ml-2 bg-red-500 text-white border-0 animate-pulse"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                    
                    {/* Tooltip for collapsed sidebar */}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 top-2 z-50 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
                          {item.name}
                          {item.badge && item.badge > 0 && (
                            <span className="ml-1 bg-red-500 text-white rounded-full px-1">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* User Profile */}
            {sidebarOpen && adminInfo && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                          {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {adminInfo.firstName} {adminInfo.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {adminInfo.role}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div>
                        <p className="text-sm font-medium">{adminInfo.firstName} {adminInfo.lastName}</p>
                        <p className="text-xs text-muted-foreground">{adminInfo.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
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

        {/* Enhanced Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Top Header - Simplified */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-6 py-3">
              {/* Left side - Logo/Brand for mobile */}
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-2"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Portal
                </h2>
              </div>

              {/* Enhanced Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Quick Stats */}
                {sidebarOpen && stats && (
                  <div className="hidden lg:flex items-center space-x-4 mr-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(stats.pendingRenewals || 0) + (stats.newMessages || 0)}
                      </div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">
                        {stats.upcomingEvents || 0}
                      </div>
                      <div className="text-xs text-gray-500">Events</div>
                    </div>
                  </div>
                )}

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full p-2"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* Quick Actions */}
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Reports
                  </Link>
                </Button>

                <Button variant="outline" size="sm" asChild className="relative">
                  <Link href="/admin/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Notifications</span>
                    {stats?.newMessages && stats.newMessages > 0 && (
                      <Badge variant="destructive" className="ml-2 animate-pulse">
                        {stats.newMessages}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Enhanced Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="px-8 py-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}