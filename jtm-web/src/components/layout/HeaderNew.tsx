// JTM Web - Tamil Cultural Navigation Header
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
import { 
  Shield, 
  Home, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  Users,
  Bell
} from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          setIsAdmin(data.isAdmin || false)
        })
        .catch(() => setIsAdmin(false))
    }
  }, [session])

  const navigation = session && !isAdmin ? [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Profile', href: '/member', icon: User },
  ] : []

  const adminNavigation = session && isAdmin ? [
    { name: 'Admin Portal', href: '/admin', icon: Shield },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Events', href: '/admin/events', icon: Calendar },
  ] : []

  const activeNav = isAdmin ? adminNavigation : navigation

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Tamil Inspired with JTM Logo Image */}
          <Link href={session ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden border-2 border-primary/20">
                <Image
                  src="/images/jtmlogo.png"
                  alt="JTM Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Jacksonville Tamil Mandram
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Connecting Tamil Community in Florida
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {session && (
            <nav className="hidden md:flex items-center space-x-1">
              {activeNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm
                      transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {session ? (
              <>
                {/* Admin Badge */}
                {isAdmin && (
                  <Badge className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white border-0 px-3 py-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}

                {/* Notifications - for members */}
                {!isAdmin && (
                  <Button variant="ghost" size="sm" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      0
                    </span>
                  </Button>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/50 transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                          {session.user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-2">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                          {session.user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {session.user?.email}
                        </p>
                        {isAdmin && (
                          <Badge className="mt-1 text-xs bg-primary/10 text-primary border-primary/20">
                            Administrator
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {isAdmin ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Portal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/members" className="cursor-pointer">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Members
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="cursor-pointer">
                            <Home className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/member" className="cursor-pointer">
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
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/auth/login' })} 
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" asChild>
                  <Link href="/auth/register">Join Now</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {session && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col space-y-2">
              {activeNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl font-medium
                      transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
