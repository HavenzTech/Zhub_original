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

    // DEV MODE: Bypass authentication if enabled
    const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    if (devMode) {
      console.log('[DEV MODE] Authentication bypassed - using mock user')
      return {
        token: 'dev-mode-token',
        userId: 'dev-user-123',
        email: 'dev@havenhub.com',
        name: 'Dev User',
        companies: [{
          companyId: 'dev-company-1',
          name: 'Dev Company',
          role: 'super_admin'
        }],
        currentCompanyId: 'dev-company-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }
    }

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
   * Get user's role for the current company
   */
  getCurrentRole(): 'super_admin' | 'admin' | 'member' | 'viewer' | null {
    const auth = this.getAuth()
    if (!auth || !auth.currentCompanyId) return null

    const company = auth.companies.find(c => c.companyId === auth.currentCompanyId)
    return company?.role || null
  }

  /**
   * Check if user is a super admin
   */
  isSuperAdmin(): boolean {
    const role = this.getCurrentRole()
    return role === 'super_admin'
  }

  /**
   * Check if user has permission for an action
   */
  hasPermission(action: 'create' | 'update' | 'delete', entity: string): boolean {
    const role = this.getCurrentRole()
    if (!role) return false

    // Super admin has all permissions (including creating companies)
    if (role === 'super_admin') return true

    // Admin has all permissions except creating companies
    if (role === 'admin') {
      if (action === 'create' && entity === 'company') return false
      return true
    }

    // Viewer has no write permissions
    if (role === 'viewer') return false

    // Member permissions based on entity
    if (role === 'member') {
      if (action === 'create') {
        // Members can create projects and documents
        return entity === 'project' || entity === 'document'
      }
      if (action === 'update') {
        // Members can update projects and documents
        return entity === 'project' || entity === 'document'
      }
      // Members cannot delete
      return false
    }

    return false
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
