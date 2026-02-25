// JTM Web - Login Form Component
'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, update } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. Please try again.')
      } else {
        // Force session refresh to get latest user data
        await update()
        
        // Fetch session to check mustChangePassword and renewal flags
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        
        if (sessionData?.user?.mustChangePassword) {
          // Redirect to password change page
          router.push('/auth/change-password')
        } else if (!sessionData?.user?.isActive) {
          // User's membership has expired - redirect to renewal page
          router.push('/renewal')
        } else {
          // Redirect to dashboard
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none lg:elevated-card lg:border-t-4 lg:border-t-primary lg:backdrop-blur-sm lg:bg-white/90 dark:bg-gray-900/90">
      {/* Header — hidden on mobile (page gradient banner handles branding) */}
      <CardHeader className="hidden lg:flex space-y-3 text-center pb-8 flex-col items-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mb-2">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sign In
          </span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600 dark:text-gray-300">
          Access your JTM Community account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-2 lg:pt-0">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1 bg-cyan-100 rounded-md">
                <Mail className="h-3.5 w-3.5 text-cyan-700" />
              </div>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-2 focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1 bg-indigo-100 rounded-md">
                <Lock className="h-3.5 w-3.5 text-indigo-700" />
              </div>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-2 focus:border-indigo-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-primary hover:text-secondary transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign In
              </span>
            )}
          </Button>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-4 text-gray-600 dark:text-gray-300 font-medium">
                New to JTM?
              </span>
            </div>
          </div>
          
          <Button 
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
            asChild
          >
            <Link href="/auth/register">
              <Sparkles className="h-5 w-5 mr-2" />
              Join Our Community
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
