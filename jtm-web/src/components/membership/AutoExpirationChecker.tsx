// JTM Web - Automatic Membership Expiration Checker
// This component runs in the background and automatically triggers
// membership expiration on January 1st at 12:01 AM

'use client'

import { useEffect, useState } from 'react'

interface ExpirationStatus {
  currentYear: number
  activeMembers: number
  expiredThisYear: boolean
  isExpirationDay: boolean
  nextExpirationDate: string
  daysUntilExpiration: number
}

export default function AutoExpirationChecker() {
  const [status, setStatus] = useState<ExpirationStatus | null>(null)
  const [checking, setChecking] = useState(false)

  // Check expiration status
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/membership-expiration')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.data)
        
        // If it's January 1st and not expired yet, trigger automatic expiration
        if (data.data.isExpirationDay && !data.data.expiredThisYear) {
          await triggerAutoExpiration()
        }
      }
    } catch (error) {
      console.error('Failed to check expiration status:', error)
    }
  }

  // Trigger automatic expiration
  const triggerAutoExpiration = async () => {
    if (checking) return
    
    setChecking(true)
    try {
      const response = await fetch('/api/membership-expiration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual: false }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Automatic expiration executed:', data.data)
        
        // Refresh status after expiration
        await checkStatus()
      }
    } catch (error) {
      console.error('Failed to trigger automatic expiration:', error)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    // Check immediately on mount
    checkStatus()

    // Check every hour (3600000ms)
    const hourlyInterval = setInterval(checkStatus, 3600000)

    // Special check at midnight (check every minute between 12:00 AM and 12:10 AM)
    const midnightCheck = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      
      // Between 12:00 AM and 12:10 AM, check frequently
      if (hours === 0 && minutes <= 10) {
        checkStatus()
      }
    }, 60000) // Check every minute

    return () => {
      clearInterval(hourlyInterval)
      clearInterval(midnightCheck)
    }
  }, [])

  // This component doesn't render anything visible
  // It just runs in the background
  return null
}
