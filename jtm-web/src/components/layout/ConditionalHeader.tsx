'use client'

import { usePathname } from 'next/navigation'
import { Header } from './HeaderNew'

/**
 * ConditionalHeader - Only shows the global Header on pages that don't have their own layout
 * Pages with MemberLayout or AdminLayout handle their own headers/navigation
 * Landing page (/) has its own integrated navigation
 */
export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show global header on pages that have their own layout wrapper
  // Landing page (/) has its own integrated navigation
  // MemberLayout is used on: /member, /profile, /renewal, /events
  // AdminLayout is used on: /admin/*
  const hideHeader = pathname === '/' ||
                     pathname?.startsWith('/admin') ||
                     pathname?.startsWith('/member') ||
                     pathname?.startsWith('/profile') ||
                     pathname?.startsWith('/renewal') ||
                     pathname?.startsWith('/events')
  
  if (hideHeader) {
    return null
  }
  
  return <Header />
}

