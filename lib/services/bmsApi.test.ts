import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock authService before importing bmsApi
vi.mock('./auth', () => ({
  authService: {
    refreshAccessToken: vi.fn(),
    getAuth: vi.fn(),
  },
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Import after mocks are set up
import { bmsApi, BmsApiError } from './bmsApi'
import { authService } from './auth'

// Helper to create mock responses
const createMockResponse = (options: {
  ok?: boolean
  status?: number
  statusText?: string
  json?: any
  headers?: Record<string, string>
  text?: string
}) => {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    json = {},
    headers = { 'content-type': 'application/json' },
    text = '',
  } = options

  return {
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(json),
    text: vi.fn().mockResolvedValue(text),
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
  }
}

describe('BmsApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset bmsApi state
    bmsApi.clearToken()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Token Management', () => {
    it('should set and use auth token', async () => {
      bmsApi.setToken('test-token-123')
      mockFetch.mockResolvedValueOnce(createMockResponse({ json: { data: 'test' } }))

      await bmsApi.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      )
    })

    it('should set and use company ID', async () => {
      bmsApi.setToken('test-token')
      bmsApi.setCompanyId('company-123')
      mockFetch.mockResolvedValueOnce(createMockResponse({ json: {} }))

      await bmsApi.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Company-Id': 'company-123',
          }),
        })
      )
    })

    it('should clear token and company ID', async () => {
      bmsApi.setToken('test-token')
      bmsApi.setCompanyId('company-123')
      bmsApi.clearToken()

      mockFetch.mockResolvedValueOnce(createMockResponse({ json: {} }))
      await bmsApi.get('/test')

      const callHeaders = mockFetch.mock.calls[0][1].headers
      expect(callHeaders.Authorization).toBeUndefined()
      expect(callHeaders['X-Company-Id']).toBeUndefined()
    })

    it('should skip auth headers when skipAuth is true', async () => {
      bmsApi.setToken('test-token')
      bmsApi.setCompanyId('company-123')
      mockFetch.mockResolvedValueOnce(createMockResponse({ json: {} }))

      await bmsApi.get('/test', { skipAuth: true })

      const callHeaders = mockFetch.mock.calls[0][1].headers
      expect(callHeaders.Authorization).toBeUndefined()
      expect(callHeaders['X-Company-Id']).toBeUndefined()
    })
  })

  describe('HTTP Methods', () => {
    beforeEach(() => {
      bmsApi.setToken('test-token')
    })

    describe('GET', () => {
      it('should make GET request', async () => {
        const mockData = { id: '1', name: 'Test' }
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: mockData }))

        const result = await bmsApi.get('/users/1')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/havenzhub/users/1'),
          expect.objectContaining({ method: 'GET' })
        )
        expect(result).toEqual(mockData)
      })
    })

    describe('POST', () => {
      it('should make POST request with JSON body', async () => {
        const requestData = { name: 'New User', email: 'test@example.com' }
        const responseData = { id: '1', ...requestData }
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: responseData }))

        const result = await bmsApi.post('/users', requestData)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/havenzhub/users'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
        expect(result).toEqual(responseData)
      })
    })

    describe('PUT', () => {
      it('should make PUT request with JSON body', async () => {
        const requestData = { name: 'Updated User' }
        const responseData = { id: '1', ...requestData }
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: responseData }))

        const result = await bmsApi.put('/users/1', requestData)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/havenzhub/users/1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(requestData),
          })
        )
        expect(result).toEqual(responseData)
      })
    })

    describe('DELETE', () => {
      it('should make DELETE request', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ status: 204 }))

        await bmsApi.delete('/users/1')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/havenzhub/users/1'),
          expect.objectContaining({ method: 'DELETE' })
        )
      })
    })
  })

  describe('Response Handling', () => {
    beforeEach(() => {
      bmsApi.setToken('test-token')
    })

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ status: 204, ok: true }))

      const result = await bmsApi.delete('/users/1')

      expect(result).toBeUndefined()
    })

    it('should handle empty response with content-length 0', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          json: {},
          headers: { 'content-type': 'application/json', 'content-length': '0' },
        })
      )

      const result = await bmsApi.get('/test')

      expect(result).toBeUndefined()
    })

    it('should handle non-JSON response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          headers: { 'content-type': 'text/plain' },
        })
      )

      const result = await bmsApi.get('/test')

      expect(result).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      bmsApi.setToken('test-token')
    })

    it('should throw BmsApiError on 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: { message: 'Validation failed', errors: { name: ['Required'] } },
        })
      )

      try {
        await bmsApi.post('/users', {})
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(BmsApiError)
        expect(error).toMatchObject({
          message: 'Validation failed',
          status: 400,
        })
      }
    })

    it('should throw BmsApiError on 404 Not Found', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: { message: 'User not found' },
        })
      )

      await expect(bmsApi.get('/users/999')).rejects.toMatchObject({
        message: 'User not found',
        status: 404,
      })
    })

    it('should throw BmsApiError on 500 Server Error', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: { message: 'Something went wrong' },
        })
      )

      await expect(bmsApi.get('/test')).rejects.toMatchObject({
        message: 'Something went wrong',
        status: 500,
      })
    })

    it('should handle non-JSON error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: {
          get: () => 'text/html',
        },
      })

      await expect(bmsApi.get('/test')).rejects.toMatchObject({
        message: 'Internal Server Error',
        status: 500,
      })
    })

    it('should throw timeout error on request timeout', async () => {
      vi.useFakeTimers()

      // Create a promise that never resolves
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('Aborted')
              error.name = 'AbortError'
              reject(error)
            }, 100)
          })
      )

      const promise = bmsApi.get('/test', { timeout: 50 })

      vi.advanceTimersByTime(100)

      await expect(promise).rejects.toMatchObject({
        message: 'Request timeout',
        status: 408,
      })

      vi.useRealTimers()
    })
  })

  describe('401 Token Refresh', () => {
    beforeEach(() => {
      bmsApi.setToken('expired-token')
    })

    it('should refresh token and retry on 401', async () => {
      // First call returns 401
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: { message: 'Token expired' },
        })
      )

      // Mock successful token refresh
      vi.mocked(authService.refreshAccessToken).mockResolvedValueOnce(true)
      vi.mocked(authService.getAuth).mockReturnValueOnce({
        token: 'new-token-123',
        refreshToken: 'refresh-token',
        userId: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        companies: [],
        currentCompanyId: null,
        expiresAt: null,
      })

      // Retry call succeeds
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ json: { data: 'success' } })
      )

      const result = await bmsApi.get('/test')

      expect(authService.refreshAccessToken).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ data: 'success' })
    })

    it('should throw error if token refresh fails', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: { message: 'Token expired' },
        })
      )

      vi.mocked(authService.refreshAccessToken).mockResolvedValueOnce(false)

      await expect(bmsApi.get('/test')).rejects.toMatchObject({
        message: 'Token expired',
        status: 401,
      })
    })

    it('should not retry more than once', async () => {
      // Both calls return 401
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: { message: 'Token expired' },
        })
      )

      vi.mocked(authService.refreshAccessToken).mockResolvedValue(true)
      vi.mocked(authService.getAuth).mockReturnValue({
        token: 'still-invalid-token',
        refreshToken: 'refresh-token',
        userId: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        companies: [],
        currentCompanyId: null,
        expiresAt: null,
      })

      await expect(bmsApi.get('/test')).rejects.toMatchObject({
        status: 401,
      })

      // Should only retry once (2 total calls)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should not attempt refresh when skipAuth is true', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: { message: 'Unauthorized' },
        })
      )

      await expect(bmsApi.get('/test', { skipAuth: true })).rejects.toMatchObject({
        status: 401,
      })

      expect(authService.refreshAccessToken).not.toHaveBeenCalled()
    })
  })

  describe('Entity Endpoints', () => {
    beforeEach(() => {
      bmsApi.setToken('test-token')
      bmsApi.setCompanyId('company-1')
    })

    describe('Users', () => {
      it('should get all users', async () => {
        const mockUsers = [{ id: '1', name: 'User 1' }]
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: mockUsers }))

        const result = await bmsApi.users.getAll()

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/users'),
          expect.any(Object)
        )
        expect(result).toEqual(mockUsers)
      })

      it('should get user by ID', async () => {
        const mockUser = { id: '1', name: 'User 1' }
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: mockUser }))

        const result = await bmsApi.users.getById('1')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/users/1'),
          expect.any(Object)
        )
        expect(result).toEqual(mockUser)
      })

      it('should create user', async () => {
        const newUser = { name: 'New User', email: 'new@example.com' }
        const createdUser = { id: '2', ...newUser }
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: createdUser }))

        const result = await bmsApi.users.create(newUser)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/users'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newUser),
          })
        )
        expect(result).toEqual(createdUser)
      })
    })

    describe('Projects', () => {
      it('should get all projects', async () => {
        const mockProjects = [{ id: '1', name: 'Project 1' }]
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: mockProjects }))

        await bmsApi.projects.getAll()

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/projects'),
          expect.any(Object)
        )
      })

      it('should get projects by status', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: [] }))

        await bmsApi.projects.getByStatus('active')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/projects/status/active'),
          expect.any(Object)
        )
      })

      it('should add member to project', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: {} }))

        await bmsApi.projects.addMember('project-1', { userId: 'user-1', role: 'member' })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/projects/project-1/members'),
          expect.objectContaining({ method: 'POST' })
        )
      })
    })

    describe('Tasks', () => {
      it('should get tasks with filters', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: { data: [], total: 0 } }))

        await bmsApi.tasks.getAll({
          page: 1,
          pageSize: 10,
          status: 'in_progress',
          projectId: 'project-1',
        })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/tasks\?.*page=1.*pageSize=10.*status=in_progress.*projectId=project-1/),
          expect.any(Object)
        )
      })

      it('should update task status', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: {} }))

        await bmsApi.tasks.updateStatus('task-1', 'completed')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tasks/task-1/status/completed'),
          expect.objectContaining({ method: 'PATCH' })
        )
      })

      it('should assign task to user', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: {} }))

        await bmsApi.tasks.assign('task-1', 'user-1')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tasks/task-1/assign/user-1'),
          expect.objectContaining({ method: 'PATCH' })
        )
      })
    })

    describe('Expenses', () => {
      it('should get expenses by project with filters', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: { data: [], total: 0 } }))

        await bmsApi.expenses.getByProject('project-1', {
          status: 'pending',
          category: 'software',
        })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/expenses\/project\/project-1\?.*status=pending.*category=software/),
          expect.any(Object)
        )
      })

      it('should create expense', async () => {
        const expenseData = {
          projectId: 'project-1',
          description: 'Software license',
          amount: 99.99,
          expenseDate: '2025-01-15',
          category: 'software',
        }
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: { id: '1', ...expenseData } }))

        await bmsApi.expenses.create(expenseData)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/expenses'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(expenseData),
          })
        )
      })

      it('should approve expense', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({
            json: { id: '1', status: 'approved', message: 'Expense approved' },
          })
        )

        const result = await bmsApi.expenses.approve('expense-1')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/expenses/expense-1/approve'),
          expect.objectContaining({ method: 'POST' })
        )
        expect(result.status).toBe('approved')
      })

      it('should reject expense with reason', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({
            json: { id: '1', status: 'rejected', message: 'Expense rejected' },
          })
        )

        await bmsApi.expenses.reject('expense-1', { reason: 'Missing receipt' })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/expenses/expense-1/reject'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ reason: 'Missing receipt' }),
          })
        )
      })
    })

    describe('Notifications', () => {
      it('should get notifications with pagination', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: { data: [], total: 0 } }))

        await bmsApi.notifications.getAll({ page: 1, pageSize: 10, unreadOnly: true })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/notifications\?.*page=1.*pageSize=10.*unreadOnly=true/),
          expect.any(Object)
        )
      })

      it('should get unread count', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ json: { count: 5 } }))

        const result = await bmsApi.notifications.getUnreadCount()

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/notifications/unread-count'),
          expect.any(Object)
        )
        expect(result.count).toBe(5)
      })

      it('should mark notification as read', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ status: 204 }))

        await bmsApi.notifications.markAsRead('notif-1')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/notifications/notif-1/read'),
          expect.objectContaining({ method: 'PATCH' })
        )
      })

      it('should mark all notifications as read', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ status: 204 }))

        await bmsApi.notifications.markAllAsRead()

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/notifications/read-all'),
          expect.objectContaining({ method: 'PATCH' })
        )
      })
    })
  })

  describe('Health Check', () => {
    it('should call health endpoint at root path', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ json: { status: 'healthy' } }))

      await bmsApi.healthCheck()

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/health'))
      expect(mockFetch).toHaveBeenCalledWith(expect.not.stringContaining('/api/havenzhub'))
    })
  })
})
