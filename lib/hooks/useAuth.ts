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

    if (!authData) {
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
