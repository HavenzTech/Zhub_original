// Auth service for API calls
import type { LoginRequest, LoginResponse, AuthState, ApiError } from '@/lib/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5087'

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await this.handleError(response)
      throw error
    }

    const data: LoginResponse = await response.json()
    return data
  }

  /**
   * Store auth data in localStorage
   */
  storeAuth(authData: LoginResponse): void {
    const authState: AuthState = {
      token: authData.token,
      userId: authData.userId,
      email: authData.email,
      name: authData.name,
      companies: authData.companies,
      // Default to first company if available
      currentCompanyId: authData.companies[0]?.companyId || null,
      expiresAt: authData.expiresAt,
    }

    localStorage.setItem('auth', JSON.stringify(authState))
  }

  /**
   * Get stored auth data
   */
  getAuth(): AuthState | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem('auth')
    if (!stored) return null

    try {
      const auth: AuthState = JSON.parse(stored)

      // Check if token is expired
      if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) {
        this.clearAuth()
        return null
      }

      return auth
    } catch {
      return null
    }
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    const auth = this.getAuth()
    return auth?.token || null
  }

  /**
   * Get current company ID
   */
  getCurrentCompanyId(): string | null {
    const auth = this.getAuth()
    return auth?.currentCompanyId || null
  }

  /**
   * Set current company ID
   */
  setCurrentCompanyId(companyId: string): void {
    const auth = this.getAuth()
    if (!auth) return

    auth.currentCompanyId = companyId
    localStorage.setItem('auth', JSON.stringify(auth))
  }

  /**
   * Clear auth data (logout)
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuth() !== null
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorData: ApiError = {
      message: 'An error occurred',
      status: response.status,
    }

    try {
      const data = await response.json()

      if (typeof data === 'string') {
        errorData.message = data
      } else if (data.message) {
        errorData.message = data.message
        errorData.errors = data.errors
      } else if (data.title) {
        // Handle ASP.NET Core ValidationProblem format
        errorData.message = data.title
        errorData.errors = data.errors
      }
    } catch {
      // If JSON parsing fails, use status text
      errorData.message = response.statusText || 'An error occurred'
    }

    return errorData
  }

  /**
   * Create authorized fetch headers
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    const companyId = this.getCurrentCompanyId()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (companyId) {
      headers['X-Company-Id'] = companyId
    }

    return headers
  }
}

// Export singleton instance
export const authService = new AuthService()
