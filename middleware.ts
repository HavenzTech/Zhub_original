import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup']

// Routes that require admin privileges
const adminRoutes = ['/users']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for authentication token in cookies or headers
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // TODO: Validate JWT token here
  // For now, we trust that the token exists
  // In production, you should:
  // 1. Verify JWT signature
  // 2. Check token expiration
  // 3. Validate user permissions for admin routes

  // Check admin routes (basic check - enhance with JWT payload validation)
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // TODO: Extract role from JWT and verify it's admin/super_admin
    // For now, we allow if token exists
    // In production: decode JWT, check role claim
  }

  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
