import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentRole, hasPermission, getPermissions, getRoleInfo } from './permissions'
import { authService } from '@/lib/services/auth'

// Mock the auth service
vi.mock('@/lib/services/auth', () => ({
  authService: {
    getAuth: vi.fn(),
  },
}))

const mockGetAuth = vi.mocked(authService.getAuth)

function mockAuth(role: string, companyId: string = 'company-1') {
  mockGetAuth.mockReturnValue({
    token: 'test-token',
    currentCompanyId: companyId,
    companies: [{ companyId, role, companyName: 'Test Co' }],
    user: { id: 'user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
  } as any)
}

describe('permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentRole', () => {
    it('should return null when not authenticated', () => {
      mockGetAuth.mockReturnValue(null)
      expect(getCurrentRole()).toBe(null)
    })

    it('should return null when no current company', () => {
      mockGetAuth.mockReturnValue({
        token: 'test-token',
        currentCompanyId: null,
        companies: [],
        user: { id: 'user-1' },
      } as any)
      expect(getCurrentRole()).toBe(null)
    })

    it('should return the role for the current company', () => {
      mockAuth('admin')
      expect(getCurrentRole()).toBe('admin')
    })

    it('should return null when current company is not in companies list', () => {
      mockGetAuth.mockReturnValue({
        token: 'test-token',
        currentCompanyId: 'company-999',
        companies: [{ companyId: 'company-1', role: 'admin', companyName: 'Test Co' }],
        user: { id: 'user-1' },
      } as any)
      expect(getCurrentRole()).toBe(null)
    })
  })

  describe('hasPermission', () => {
    it('should return false when not authenticated', () => {
      mockGetAuth.mockReturnValue(null)
      expect(hasPermission('create')).toBe(false)
      expect(hasPermission('edit')).toBe(false)
      expect(hasPermission('delete')).toBe(false)
      expect(hasPermission('view')).toBe(false)
    })

    describe('admin role', () => {
      beforeEach(() => mockAuth('admin'))

      it('should allow all actions', () => {
        expect(hasPermission('create')).toBe(true)
        expect(hasPermission('edit')).toBe(true)
        expect(hasPermission('delete')).toBe(true)
        expect(hasPermission('view')).toBe(true)
      })
    })

    describe('member role', () => {
      beforeEach(() => mockAuth('member'))

      it('should allow create, edit, and view', () => {
        expect(hasPermission('create')).toBe(true)
        expect(hasPermission('edit')).toBe(true)
        expect(hasPermission('view')).toBe(true)
      })

      it('should deny delete', () => {
        expect(hasPermission('delete')).toBe(false)
      })
    })

    describe('viewer role', () => {
      beforeEach(() => mockAuth('viewer'))

      it('should only allow view', () => {
        expect(hasPermission('view')).toBe(true)
      })

      it('should deny create, edit, and delete', () => {
        expect(hasPermission('create')).toBe(false)
        expect(hasPermission('edit')).toBe(false)
        expect(hasPermission('delete')).toBe(false)
      })
    })
  })

  describe('getPermissions', () => {
    it('should return all-false permissions when not authenticated', () => {
      mockGetAuth.mockReturnValue(null)
      expect(getPermissions()).toEqual({
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canView: false,
      })
    })

    it('should return full permissions for admin', () => {
      mockAuth('admin')
      expect(getPermissions()).toEqual({
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
      })
    })

    it('should return member permissions', () => {
      mockAuth('member')
      expect(getPermissions()).toEqual({
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canView: true,
      })
    })

    it('should return viewer permissions', () => {
      mockAuth('viewer')
      expect(getPermissions()).toEqual({
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canView: true,
      })
    })
  })

  describe('getRoleInfo', () => {
    it('should return correct info for admin', () => {
      const info = getRoleInfo('admin')
      expect(info.label).toBe('Administrator')
      expect(info.badge).toBe('ADMIN')
    })

    it('should return correct info for member', () => {
      const info = getRoleInfo('member')
      expect(info.label).toBe('Member')
      expect(info.badge).toBe('MEMBER')
    })

    it('should return correct info for viewer', () => {
      const info = getRoleInfo('viewer')
      expect(info.label).toBe('Viewer')
      expect(info.badge).toBe('VIEWER')
    })
  })
})
