'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, LogIn, UserPlus } from 'lucide-react'

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Sign In', href: '/auth/login', icon: LogIn },
  { label: 'Register', href: '/auth/register', icon: UserPlus },
]

export function PublicBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />
      <div className="bg-white/92 backdrop-blur-md shadow-[0_-4px_20px_rgba(8,145,178,0.12)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {tabs.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 px-6 py-2 group"
              >
                <span
                  className={`transition-all duration-200 ${
                    active
                      ? 'text-cyan-600 scale-110'
                      : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`text-[10px] font-semibold leading-none transition-colors ${
                    active ? 'text-cyan-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-cyan-600" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
