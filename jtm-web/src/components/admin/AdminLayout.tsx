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
    },
    {
      name: 'User Management',
      href: '/admin/members',
      icon: Users,
      current: pathname.startsWith('/admin/members'),
      badge: stats?.pendingRenewals || 0,
    },
    {
      name: 'Event Management',
      href: '/admin/events',
      icon: Calendar,
      current: pathname.startsWith('/admin/events'),
      badge: stats?.upcomingEvents || 0,
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      current: pathname.startsWith('/admin/notifications'),
      badge: stats?.newMessages || 0,
    },
    {
      name: 'Analytics & Reports',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/admin/analytics'),
    },
    {
      name: 'Bulk Import',
      href: '/admin/bulk-import',
      icon: UserPlus,
      current: pathname.startsWith('/admin/bulk-import'),
    },
    {
      name: 'Renewals',
      href: '/admin/renewals',
      icon: RefreshCcw,
      current: pathname.startsWith('/admin/renewals'),
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              {sidebarOpen ? (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    JTM
                  </div>
                  <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Portal
                  </span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  JTM
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      item.current
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.name}</span>}
                    </div>
                    {sidebarOpen && item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User Profile */}
            {sidebarOpen && adminInfo && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>
                          {adminInfo.firstName[0]}{adminInfo.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {adminInfo.firstName} {adminInfo.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {adminInfo.role}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
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
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search members, events, or anything..."
                    className="pl-10 pr-4 w-full"
                  />
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Reports
                  </Link>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {stats?.newMessages && stats.newMessages > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {stats.newMessages}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}