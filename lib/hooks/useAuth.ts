// Auth hook for client-side authentication checks
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/auth'
import type { AuthState } from '@/lib/types/auth'

export function useAuth(redirectTo = '/login') {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authData = authService.getAuth()

    // DEV MODE: Check if dev mode is enabled
    const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

    if (!authData && !devMode) {
      router.push(redirectTo)
      return
    }

    setAuth(authData)
    setLoading(false)
  }, [router, redirectTo])

  return { auth, loading, isAuthenticated: !!auth }
}

export function useRequireAuth(redirectTo = '/login') {
  const { auth, loading } = useAuth(redirectTo)

  return { auth, loading }
}
