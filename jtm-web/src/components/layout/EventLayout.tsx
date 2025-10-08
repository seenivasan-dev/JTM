'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Calendar, 
  Plus, 
  List, 
  QrCode,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventLayoutProps {
  children: React.ReactNode
  userRole?: 'admin' | 'member'
  showBackButton?: boolean
  title?: string
}

export default function EventLayout({ 
  children, 
  userRole = 'member',
  showBackButton = false,
  title
}: EventLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'All Events',
      href: '/events',
      icon: Calendar,
      current: pathname === '/events',
      badge: null,
    },
    ...(userRole === 'admin' ? [
      {
        name: 'Create Event',
        href: '/events/create',
        icon: Plus,
        current: pathname === '/events/create',
        badge: null,
      },
      {
        name: 'Event Management',
        href: '/admin/events',
        icon: Settings,
        current: pathname === '/admin/events',
        badge: 'Admin',
      },
      {
        name: 'QR Scanner',
        href: '/events/scanner',
        icon: QrCode,
        current: pathname === '/events/scanner',
        badge: null,
      },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Events</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <IconComponent className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-2 space-y-1">
              <Link
                href="/dashboard"
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <Home className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                Back to Dashboard
              </Link>
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {title || 'Events'}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="mr-4"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  </div>
                )}
              </div>
              
              {userRole === 'admin' && !pathname.includes('/create') && (
                <div className="flex items-center space-x-4">
                  <Link href="/events/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}