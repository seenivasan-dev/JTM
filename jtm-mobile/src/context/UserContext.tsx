// JTM Mobile - User Context for managing logged-in user data
import React, { createContext, useContext, useState } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  mobileNumber?: string
  membershipType: string
  membershipExpiry?: string
  isActive: boolean
  mustChangePassword: boolean
  lastLogin?: string
  address?: {
    id: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  familyMembers?: Array<{
    id: string
    firstName: string
    lastName: string
    relationship: string
    age?: number
    email?: string
  }>
  notifications?: {
    email: boolean
    push: boolean
    eventReminders: boolean
    membershipRenewal: boolean
    adminUpdates: boolean
  }
  isAdmin: boolean
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setUser = (userData: User | null) => {
    setUserState(userData)
  }

  const logout = () => {
    setUserState(null)
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}