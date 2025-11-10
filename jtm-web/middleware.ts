// JTM Web - Middleware for Route Protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/error',
  ]

  // Password change route
  const passwordChangeRoute = '/auth/change-password'

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated
  if (token) {
    // If user must change password and is not on the password change page
    if (token.mustChangePassword && pathname !== passwordChangeRoute) {
      // Allow access only to logout and password change
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL(passwordChangeRoute, request.url))
      }
    }

    // If user has changed password and tries to access password change page
    // redirect them to dashboard
    if (!token.mustChangePassword && pathname === passwordChangeRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If user is on login page but already authenticated, redirect to dashboard
    if (pathname === '/auth/login') {
      if (token.mustChangePassword) {
        return NextResponse.redirect(new URL(passwordChangeRoute, request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
