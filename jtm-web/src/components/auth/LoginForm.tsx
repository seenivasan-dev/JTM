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
import { LogIn, Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react'

const inputCls = 'h-11 border-gray-200 bg-white focus-visible:ring-cyan-500 focus-visible:border-cyan-500 rounded-xl placeholder:text-gray-400 placeholder:italic'

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
    <Card className="w-full max-w-md mx-auto border-2 border-gray-100 shadow-xl rounded-2xl bg-white overflow-hidden">
      {/* Header — hidden on mobile (page hero provides branding), visible on desktop */}
      <CardHeader className="hidden lg:flex flex-col items-center space-y-3 text-center pb-5 pt-6 bg-gradient-to-r from-cyan-50 to-indigo-50">
        <div className="flex mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 items-center justify-center shadow-lg">
          <LogIn className="h-7 w-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-0.5">
            Sign in to your JTM member account
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-5 px-6">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-xl">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gray-400" /> Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputCls} pr-10`}
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
              className="text-sm text-cyan-700 hover:text-cyan-600 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 px-6 pb-6">
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
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
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-500 font-medium">
                New to JTM?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800 transition-all rounded-xl"
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
