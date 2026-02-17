import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

// Routes for required actions (require auth but bypass normal routing)
const requiredActionRoutes = ['/change-password', '/mfa-setup']

// Routes that require admin privileges
const adminRoutes = ['/users']

// JWT claim key used by the HavenzHub backend for user role
const ROLE_CLAIM_KEY = 'role'

/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification is handled by the ASP.NET backend on API calls.
 * This is used for routing/UX decisions only (expiry check, role gating).
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Base64url decode the payload (middle segment)
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Extract user role from JWT claims.
 */
function getRoleFromClaims(claims: Record<string, any>): string | null {
  const value = claims[ROLE_CLAIM_KEY]
  if (!value) return null
  return Array.isArray(value) ? value[0] : value
}

let hasLoggedClaims = false

export function proxy(request: NextRequest) {
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

  // Decode JWT payload for expiry and role checks
  const claims = decodeJwtPayload(token)

  if (claims) {
    // Log JWT claims once in development to inspect backend token structure
    if (process.env.NODE_ENV === 'development' && !hasLoggedClaims) {
      hasLoggedClaims = true
      console.log('[Proxy] JWT claims:', JSON.stringify(claims, null, 2))
    }

    // Check token expiry
    if (claims.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (claims.exp < now) {
        // Token is expired — clear cookie and redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('auth-token')
        return response
      }
    }
  }

  // Allow required action routes if authenticated
  if (requiredActionRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check admin routes — verify user has admin or super_admin role
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (claims) {
      const role = getRoleFromClaims(claims)

      if (role) {
        const adminRoles = ['admin', 'super_admin']
        if (!adminRoles.includes(role.toLowerCase())) {
          // User doesn't have admin privileges — redirect to dashboard
          return NextResponse.redirect(new URL('/', request.url))
        }
      } else if (process.env.NODE_ENV === 'development') {
        // No role claim found — log a warning so we can identify the correct claim name
        console.warn(
          '[Proxy] No role claim found in JWT. Admin route access allowed by default.',
          'Available claims:', Object.keys(claims).join(', ')
        )
      }
    }
  }

  return NextResponse.next()
}

// Configure which routes the proxy runs on
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
