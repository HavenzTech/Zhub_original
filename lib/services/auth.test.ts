import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { LoginResponse, AuthState } from '@/lib/types/auth'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// We need to import after mocking
// Using dynamic import to ensure mocks are in place
let authService: typeof import('./auth').authService

// Helper to create mock auth data
const createMockLoginResponse = (overrides: Partial<LoginResponse> = {}): LoginResponse => ({
  token: 'mock-token-123',
  refreshToken: 'mock-refresh-token-456',
  userId: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  companies: [
    { companyId: 'company-1', companyName: 'Test Company', role: 'admin' },
  ],
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
  ...overrides,
})

const createMockAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  token: 'mock-token-123',
  refreshToken: 'mock-refresh-token-456',
  userId: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  companies: [
    { companyId: 'company-1', companyName: 'Test Company', role: 'admin' },
  ],
  currentCompanyId: 'company-1',
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  departmentIds: [],
  currentProjectId: null,
  ...overrides,
})

describe('AuthService', () => {
  let localStorageMock: Record<string, string>

  beforeEach(async () => {
    // Reset localStorage mock
    localStorageMock = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
    })

    // Mock document.cookie
    let cookieValue = ''
    Object.defineProperty(document, 'cookie', {
      get: () => cookieValue,
      set: (value: string) => {
        cookieValue = value
      },
      configurable: true,
    })

    // Reset fetch mock
    mockFetch.mockReset()

    // Re-import auth service to get fresh instance
    vi.resetModules()
    const authModule = await import('./auth')
    authService = authModule.authService
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = createMockLoginResponse()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      )
    })

    it('should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toEqual(
        expect.objectContaining({ message: 'Invalid credentials' })
      )
    })
  })

  describe('storeAuth', () => {
    it('should store auth data in localStorage', () => {
      const mockResponse = createMockLoginResponse()
      authService.storeAuth(mockResponse)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth',
        expect.any(String)
      )

      const storedData = JSON.parse(localStorageMock['auth'])
      expect(storedData.token).toBe(mockResponse.token)
      expect(storedData.email).toBe(mockResponse.email)
      expect(storedData.currentCompanyId).toBe(mockResponse.companies[0].companyId)
    })

    it('should preserve existing company selection on refresh', () => {
      // First, store initial auth with company selection
      const initialAuth = createMockAuthState({
        currentCompanyId: 'company-2',
        companies: [
          { companyId: 'company-1', companyName: 'Company 1', role: 'admin' },
          { companyId: 'company-2', companyName: 'Company 2', role: 'employee' },
        ],
      })
      localStorageMock['auth'] = JSON.stringify(initialAuth)

      // Now store new auth (simulating token refresh)
      const newResponse = createMockLoginResponse({
        companies: [
          { companyId: 'company-1', companyName: 'Company 1', role: 'admin' },
          { companyId: 'company-2', companyName: 'Company 2', role: 'employee' },
        ],
      })
      authService.storeAuth(newResponse)

      const storedData = JSON.parse(localStorageMock['auth'])
      expect(storedData.currentCompanyId).toBe('company-2') // Should preserve
    })
  })

  describe('getAuth', () => {
    it('should return null when no auth data exists', () => {
      const result = authService.getAuth()
      expect(result).toBeNull()
    })

    it('should return auth data when valid', () => {
      const mockAuth = createMockAuthState()
      localStorageMock['auth'] = JSON.stringify(mockAuth)

      const result = authService.getAuth()
      expect(result).toEqual(mockAuth)
    })

    it('should return null and clear auth when token is expired', () => {
      const expiredAuth = createMockAuthState({
        expiresAt: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
        refreshToken: null, // No refresh token
      })
      localStorageMock['auth'] = JSON.stringify(expiredAuth)

      const result = authService.getAuth()
      expect(result).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth')
    })
  })

  describe('clearAuth', () => {
    it('should remove auth from localStorage', () => {
      localStorageMock['auth'] = JSON.stringify(createMockAuthState())

      authService.clearAuth()

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when valid auth exists', () => {
      localStorageMock['auth'] = JSON.stringify(createMockAuthState())
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when no auth exists', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return token when auth exists', () => {
      localStorageMock['auth'] = JSON.stringify(createMockAuthState())
      expect(authService.getToken()).toBe('mock-token-123')
    })

    it('should return null when no auth exists', () => {
      expect(authService.getToken()).toBeNull()
    })
  })

  describe('getCurrentCompanyId', () => {
    it('should return current company ID', () => {
      localStorageMock['auth'] = JSON.stringify(createMockAuthState())
      expect(authService.getCurrentCompanyId()).toBe('company-1')
    })
  })

  describe('setCurrentCompanyId', () => {
    it('should update current company ID', () => {
      const mockAuth = createMockAuthState({
        companies: [
          { companyId: 'company-1', companyName: 'Company 1', role: 'admin' },
          { companyId: 'company-2', companyName: 'Company 2', role: 'employee' },
        ],
      })
      localStorageMock['auth'] = JSON.stringify(mockAuth)

      authService.setCurrentCompanyId('company-2')

      const updatedAuth = JSON.parse(localStorageMock['auth'])
      expect(updatedAuth.currentCompanyId).toBe('company-2')
    })
  })

  describe('Role Checks', () => {
    describe('getCurrentRole', () => {
      it('should return role for current company', () => {
        localStorageMock['auth'] = JSON.stringify(createMockAuthState())
        expect(authService.getCurrentRole()).toBe('admin')
      })

      it('should return null when no auth', () => {
        expect(authService.getCurrentRole()).toBeNull()
      })
    })

    describe('isSuperAdmin', () => {
      it('should return true for super_admin role', () => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'super_admin' }],
          })
        )
        expect(authService.isSuperAdmin()).toBe(true)
      })

      it('should return false for admin role', () => {
        localStorageMock['auth'] = JSON.stringify(createMockAuthState())
        expect(authService.isSuperAdmin()).toBe(false)
      })
    })

    describe('isAdmin', () => {
      it('should return true for admin role', () => {
        localStorageMock['auth'] = JSON.stringify(createMockAuthState())
        expect(authService.isAdmin()).toBe(true)
      })

      it('should return true for super_admin role', () => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'super_admin' }],
          })
        )
        expect(authService.isAdmin()).toBe(true)
      })

      it('should return false for employee role', () => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'employee' }],
          })
        )
        expect(authService.isAdmin()).toBe(false)
      })
    })

    describe('hasManagementRole', () => {
      it.each([
        ['super_admin', true],
        ['admin', true],
        ['dept_manager', true],
        ['project_lead', true],
        ['employee', false],
      ])('should return %s for %s role', (role, expected) => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: role as any }],
          })
        )
        expect(authService.hasManagementRole()).toBe(expected)
      })
    })
  })

  describe('hasPermission', () => {
    describe('super_admin', () => {
      beforeEach(() => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'super_admin' }],
          })
        )
      })

      it('should have all permissions including creating companies', () => {
        expect(authService.hasPermission('create', 'company')).toBe(true)
        expect(authService.hasPermission('create', 'task')).toBe(true)
        expect(authService.hasPermission('delete', 'document')).toBe(true)
      })
    })

    describe('admin', () => {
      beforeEach(() => {
        localStorageMock['auth'] = JSON.stringify(createMockAuthState())
      })

      it('should have all permissions except creating companies', () => {
        expect(authService.hasPermission('create', 'company')).toBe(false)
        expect(authService.hasPermission('create', 'task')).toBe(true)
        expect(authService.hasPermission('delete', 'document')).toBe(true)
        expect(authService.hasPermission('update', 'project')).toBe(true)
      })
    })

    describe('dept_manager', () => {
      beforeEach(() => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'dept_manager' }],
          })
        )
      })

      it('should manage tasks and documents', () => {
        expect(authService.hasPermission('create', 'task')).toBe(true)
        expect(authService.hasPermission('update', 'task')).toBe(true)
        expect(authService.hasPermission('delete', 'task')).toBe(true)
        expect(authService.hasPermission('create', 'document')).toBe(true)
      })

      it('should not manage departments or projects', () => {
        expect(authService.hasPermission('create', 'department')).toBe(false)
        expect(authService.hasPermission('update', 'project')).toBe(false)
      })
    })

    describe('project_lead', () => {
      beforeEach(() => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'project_lead' }],
          })
        )
      })

      it('should manage tasks', () => {
        expect(authService.hasPermission('create', 'task')).toBe(true)
        expect(authService.hasPermission('update', 'task')).toBe(true)
        expect(authService.hasPermission('delete', 'task')).toBe(true)
      })

      it('should create and update documents but not delete', () => {
        expect(authService.hasPermission('create', 'document')).toBe(true)
        expect(authService.hasPermission('update', 'document')).toBe(true)
        expect(authService.hasPermission('delete', 'document')).toBe(false)
      })
    })

    describe('employee', () => {
      beforeEach(() => {
        localStorageMock['auth'] = JSON.stringify(
          createMockAuthState({
            companies: [{ companyId: 'company-1', companyName: 'Test', role: 'employee' }],
          })
        )
      })

      it('should only update tasks', () => {
        expect(authService.hasPermission('update', 'task')).toBe(true)
        expect(authService.hasPermission('create', 'task')).toBe(false)
        expect(authService.hasPermission('delete', 'task')).toBe(false)
      })

      it('should not manage documents', () => {
        expect(authService.hasPermission('create', 'document')).toBe(false)
        expect(authService.hasPermission('update', 'document')).toBe(false)
        expect(authService.hasPermission('delete', 'document')).toBe(false)
      })
    })
  })

  describe('canCreateTasks / canDeleteTasks', () => {
    it.each([
      ['super_admin', true, true],
      ['admin', true, true],
      ['dept_manager', true, true],
      ['project_lead', true, true],
      ['employee', false, false],
    ])('%s: canCreate=%s, canDelete=%s', (role, canCreate, canDelete) => {
      localStorageMock['auth'] = JSON.stringify(
        createMockAuthState({
          companies: [{ companyId: 'company-1', companyName: 'Test', role: role as any }],
        })
      )
      expect(authService.canCreateTasks()).toBe(canCreate)
      expect(authService.canDeleteTasks()).toBe(canDelete)
    })
  })

  describe('getAuthHeaders', () => {
    it('should return headers with auth token and company ID', () => {
      localStorageMock['auth'] = JSON.stringify(createMockAuthState())

      const headers = authService.getAuthHeaders()

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token-123',
        'X-Company-Id': 'company-1',
      })
    })

    it('should return basic headers when not authenticated', () => {
      const headers = authService.getAuthHeaders()

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      })
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const initialAuth = createMockAuthState()
      localStorageMock['auth'] = JSON.stringify(initialAuth)

      const newResponse = createMockLoginResponse({
        token: 'new-token-789',
        refreshToken: 'new-refresh-token-012',
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newResponse),
      })

      const result = await authService.refreshAccessToken()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: initialAuth.refreshToken }),
        })
      )

      const updatedAuth = JSON.parse(localStorageMock['auth'])
      expect(updatedAuth.token).toBe('new-token-789')
    })

    it('should return false and clear auth when refresh fails', async () => {
      localStorageMock['auth'] = JSON.stringify(createMockAuthState())

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      const result = await authService.refreshAccessToken()

      expect(result).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth')
    })

    it('should return false when no refresh token exists', async () => {
      localStorageMock['auth'] = JSON.stringify(
        createMockAuthState({ refreshToken: null })
      )

      const result = await authService.refreshAccessToken()

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})
