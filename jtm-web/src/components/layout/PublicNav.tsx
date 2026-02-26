'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
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
  ChevronDown,
  Users,
  Menu,
  X,
  LayoutDashboard,
  User,
  RefreshCcw,
  LogOut,
  Sparkles,
  Calendar,
} from 'lucide-react'

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  // Member info from session
  const fullName = session?.user?.name || ''
  const firstName = fullName.split(' ')[0] || 'Member'
  const lastName = fullName.split(' ').slice(1).join(' ') || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'M'
  const membershipType = (session?.user as any)?.membershipType || 'member'
  const isActive = (session?.user as any)?.isActive !== false

  const showSignIn = !isLoggedIn && pathname !== '/auth/login'
  const showJoinNow = !isLoggedIn && pathname !== '/auth/register'

  const handleSignOut = async () => {
    setMobileOpen(false)
    await signOut({ callbackUrl: '/auth/login' })
  }

  // Nav links differ slightly for logged-in vs public users
  const publicNavLinks = [
    { label: 'Magazines', href: '/#magazines' },
    { label: 'ByLaws', href: '/bylaws' },
    { label: 'Events', href: '/#events' },
    { label: 'Membership', href: '/auth/register' },
  ]

  const memberNavLinks = [
    { label: 'Magazines', href: '/#magazines' },
    { label: 'ByLaws', href: '/bylaws' },
    { label: 'Events', href: '/events' },
  ]

  const navLinks = isLoggedIn ? memberNavLinks : publicNavLinks

  const moreLinks = [
    { label: 'Magazines', href: '/#magazines' },
    { label: 'Resources', href: '/#resources' },
    { label: 'Sponsors', href: '/#sponsors' },
    { label: 'Tamil Classes', href: '/#tamil-classes' },
    { label: 'Gallery', href: '/#gallery' },
    { label: 'History', href: '/#history' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Contact Us', href: '/#contact' },
  ]

  return (
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
              <p className="text-sm text-white/70">
                {isLoggedIn ? 'Member Portal' : 'Connecting Communities Since 2001'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm rounded-lg">
              Home
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/member"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  pathname === '/member'
                    ? 'bg-white/25 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
              >
                Dashboard
              </Link>
            )}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all flex items-center gap-1">
                More <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-white shadow-2xl rounded-xl py-2 min-w-[200px] border border-gray-100">
                {moreLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: auth buttons or member avatar */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {!isActive && (
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
                          {firstName} {lastName}
                        </div>
                        <div className="text-xs text-white/70 capitalize leading-tight">
                          {membershipType} Member
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-white/70 hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{firstName} {lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                          <Sparkles className="inline h-3 w-3 mr-1" />
                          {membershipType} Member
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
              </>
            ) : (
              <>
                {showSignIn && (
                  <Link href="/auth/login" className="hidden md:inline-flex">
                    <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/15">
                      Sign In
                    </Button>
                  </Link>
                )}
                {showJoinNow && (
                  <Link href="/auth/register">
                    <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg transition-all">
                      <Users className="mr-2 h-4 w-4" />
                      Join Now
                    </Button>
                  </Link>
                )}
              </>
            )}

            <button
              className="xl:hidden p-2 hover:bg-white/15 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-gradient-to-b from-blue-700 to-indigo-700 border-t border-white/20 shadow-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-semibold text-white bg-white/20 rounded-lg">
              Home
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link href="/member" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all">
                Dashboard
              </Link>
            )}
            {[
              { label: 'Resources', href: '/#resources' },
              { label: 'Sponsors', href: '/#sponsors' },
              { label: 'Tamil Classes', href: '/#tamil-classes' },
              { label: 'Gallery', href: '/#gallery' },
              { label: 'History', href: '/#history' },
              { label: 'FAQ', href: '/#faq' },
              { label: 'Contact Us', href: '/#contact' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-white/20 mt-2 pt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link href="/renewal" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Renewal
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-white/10 rounded-lg flex items-center gap-2 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {showSignIn && (
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full text-white/90 hover:text-white hover:bg-white/15 justify-start">
                        Sign In
                      </Button>
                    </Link>
                  )}
                  {showJoinNow && (
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Join Now
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
