'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronDown, Users, Menu, X } from 'lucide-react'

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const showSignIn = pathname !== '/auth/login'
  const showJoinNow = pathname !== '/auth/register'

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
              <p className="text-sm text-white/70">Connecting Communities Since 2001</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm rounded-lg">
              Home
            </Link>
            {[
              { label: 'Magazines', href: '/#magazines' },
              { label: 'ByLaws', href: '/bylaws' },
              { label: 'Events', href: '/#events' },
              { label: 'Membership', href: '/auth/register' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all flex items-center gap-1">
                More <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-white shadow-2xl rounded-xl py-2 min-w-[200px] border border-gray-100">
                <Link href="/#magazines" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Magazines</Link>
                <Link href="/#resources" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Resources</Link>
                <Link href="/#sponsors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Sponsors</Link>
                <Link href="/#tamil-classes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Tamil Classes</Link>
                <Link href="/#gallery" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Gallery</Link>
                <Link href="/#history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">History</Link>
                <Link href="/#faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">FAQ</Link>
                <Link href="/#contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Contact Us</Link>
              </div>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
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

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="xl:hidden bg-gradient-to-b from-blue-700 to-indigo-700 border-t border-white/20 shadow-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-white bg-white/20 rounded-lg"
            >
              Home
            </Link>
            {[
              { label: 'Magazines', href: '/#magazines' },
              { label: 'ByLaws', href: '/bylaws' },
              { label: 'Events', href: '/#events' },
              { label: 'Membership', href: '/auth/register' },
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
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
