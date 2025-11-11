'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

/**
 * ConditionalHeader - Only shows the global Header on pages that don't have their own layout
 * Pages with MemberLayout or AdminLayout handle their own headers/navigation
 */
export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show global header on pages that have their own layout
  const hideHeader = pathname?.startsWith('/admin') ||
                     pathname?.startsWith('/member') ||
                     pathname?.startsWith('/profile') ||
                     pathname?.startsWith('/renewal')
  
  if (hideHeader) {
    return null
  }
  
  return <Header />
}
