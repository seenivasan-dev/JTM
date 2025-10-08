'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function BackButton({ className = "", children = "← Back" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  )
}