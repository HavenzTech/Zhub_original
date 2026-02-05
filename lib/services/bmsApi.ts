import {
  ApiResponse,
  ApiError,
  DocumentDownloadResponse,
  ExpenseDto,
  ExpenseDtoPagedResult,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  RejectExpenseRequest,
  ExpenseActionResponse,
  ProjectExpenseSummary,
  InvoiceDownloadResponse,
  NotificationDto,
  NotificationDtoPagedResult,
  UnreadCountResponse,
  RegisterDeviceTokenRequest,
  // Document Control Types
  DocumentDto,
  DocumentVersionDto,
  DocumentPermissionDto,
  DocumentShareDto,
  DocumentSearchRequest,
  DocumentSearchResults,
  DocumentAccessLogDto,
  DocumentNeedsReviewDto,
  DocumentUserAccessDto,
  DocumentDepartmentDto,
  CheckedOutDocumentDto,
  CheckoutStatusDto,
  CheckoutRequest,
  CheckinRequest,
  CheckoutOperationResponse,
  FavoriteDocumentDto,
  RecentDocumentDto,
  RetentionPolicyDto,
  RetentionScheduleDto,
  LegalHoldRequest,
  ExtendRetentionRequest,
  DocumentTypeDto,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
  FileValidationResult,
  FolderTemplateDto,
  CreateFolderTemplateRequest,
  UpdateFolderTemplateRequest,
  ApplyFolderTemplateRequest,
  FolderTemplateApplicationDto,
  CreateRetentionPolicyRequest,
  UpdateRetentionPolicyRequest,
  WorkflowDto,
  WorkflowInstanceDto,
  WorkflowTaskDto,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  StartWorkflowRequest,
  CancelWorkflowRequest,
  CompleteTaskRequest,
  DelegateTaskRequest,
  CreateDocumentPermissionRequest,
  UpdateDocumentPermissionRequest,
  EffectivePermissionsDto,
  CreateDocumentShareRequest,
  UpdateDocumentShareRequest,
  ShareAccessLogDto,
  RestoreVersionRequest,
  ForceCheckoutCancelRequest,
  UpdateFavoriteOrderRequest,
} from '@/types/bms';
import { authService } from './auth';

// Environment variables - configured in .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_PREFIX = '/api/havenzhub';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

class BmsApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'BmsApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
  _retryCount?: number; // Internal use for retry tracking
}

class BmsApiService {
  private baseUrl: string;
  private token: string | null = null;
  private companyId: string | null = null;

  constructor(baseUrl: string = BASE_URL!) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  setCompanyId(companyId: string) {
    this.companyId = companyId;
  }

  clearToken() {
    this.token = null;
    this.companyId = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = TIMEOUT, skipAuth = false, _retryCount = 0, ...fetchOptions } = options;

    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!skipAuth && this.companyId) {
      headers['X-Company-Id'] = this.companyId;
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request:', {
        method: fetchOptions.method || 'GET',
        url,
        headers: {
          ...headers,
          Authorization: headers['Authorization'] ? `Bearer ${headers['Authorization'].substring(7, 27)}...` : 'none'
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content or empty responses
      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const contentLength = response.headers.get('content-length');

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token and retry
        if (response.status === 401 && !skipAuth && _retryCount < 1) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Update token from refreshed auth
            const newAuth = authService.getAuth();
            if (newAuth?.token) {
              this.setToken(newAuth.token);
            }
            // Retry the request once
            return this.request<T>(endpoint, { ...options, _retryCount: _retryCount + 1 });
          }
        }

        const errorText = await response.text();
        let errorData: any = { message: response.statusText };
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || response.statusText };
        }
        if (response.status !== 404) {
          console.error('❌ API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            rawText: errorText,
            errorData: errorData,
          });
        }
        throw new BmsApiError(
          errorData.message || errorData.title || errorText || 'API request failed',
          response.status,
          errorData.code,
          errorData.details || errorData.errors
        );
      }

      // Handle successful responses with no body or non-JSON responses
      if (contentLength === '0' || !isJson) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BmsApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new BmsApiError('Request timeout', 408);
        }
        throw new BmsApiError(error.message, 500);
      }

      throw new BmsApiError('Unknown error occurred', 500);
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // FormData post for file uploads
  async postFormData<T>(endpoint: string, data: FormData, options?: RequestOptions): Promise<T> {
    const { timeout = TIMEOUT, skipAuth = false, _retryCount = 0, ...fetchOptions } = options || {};
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;

    const headers: Record<string, string> = {};

    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!skipAuth && this.companyId) {
      headers['X-Company-Id'] = this.companyId;
    }

    // Debug logging for file uploads
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 FormData Upload:', {
        url,
        headers: { ...headers, Authorization: headers['Authorization'] ? 'Bearer ***' : 'none' },
      });
      // Log FormData contents
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: data,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token and retry
        if (response.status === 401 && !skipAuth && _retryCount < 1) {
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Update token from refreshed auth
            const newAuth = authService.getAuth();
            if (newAuth?.token) {
              this.setToken(newAuth.token);
            }
            // Retry the request once
            return this.postFormData<T>(endpoint, data, { ...options, _retryCount: _retryCount + 1 });
          }
        }

        let errorData: any = { message: response.statusText };
        try {
          if (isJson) {
            errorData = await response.json();
          } else {
            const errorText = await response.text();
            console.error('📛 API Error Response (non-JSON):', errorText);
            errorData = { message: errorText || response.statusText };
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        console.error('📛 API Error:', response.status, errorData);
        throw new BmsApiError(
          errorData.message || errorData.title || 'API request failed',
          response.status,
          errorData.code,
          errorData.details || errorData.errors
        );
      }

      return isJson ? await response.json() : (response as any);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BmsApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new BmsApiError('Request timeout', 408);
        }
        throw new BmsApiError(error.message, 500);
      }

      throw new BmsApiError('Unknown error occurred', 500);
    }
  }

  // Health endpoints (note: health endpoint is at root, not under /api/havenzhub)
  async healthCheck() {
    const url = `${this.baseUrl}/health`;
    const response = await fetch(url);
    return response.json();
  }

  async healthDeepCheck() {
    const url = `${this.baseUrl}/health/deep`;
    const response = await fetch(url);
    return response.json();
  }

  // User endpoints (Note: No user endpoints in Swagger - users are managed via Auth)
  users = {
    getAll: () => this.get('/users'),
    getById: (id: string) => this.get(`/users/${id}`),
    getByEmail: (email: string) => this.get(`/users/email/${encodeURIComponent(email)}`),
    getByCompany: (companyId: string) => this.get(`/users/company/${companyId}`),
    create: (data: any) => this.post('/users', data),
    update: (id: string, data: any) => this.put(`/users/${id}`, data),
    delete: (id: string) => this.delete(`/users/${id}`),
    // Avatar upload - POST /users/me/avatar/upload (own profile)
    uploadMyAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.postFormData('/users/me/avatar/upload', formData);
    },
    // Avatar upload - POST /users/{id}/avatar/upload (admin only)
    uploadAvatar: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.postFormData(`/users/${id}/avatar/upload`, formData);
    },
  };

  // Company endpoints - Swagger: /api/havenzhub/companies
  companies = {
    getAll: () => this.get('/companies'),
    getById: (id: string) => this.get(`/companies/${id}`),
    getByStatus: (status: string) => this.get(`/companies/status/${status}`),
    getByUser: (userId: string) => this.get(`/companies/user/${userId}`),
    getByIndustry: (industry: string) => this.get(`/companies/industry/${encodeURIComponent(industry)}`),
    create: (data: any) => this.post('/companies', data),
    update: (id: string, data: any) => this.put(`/companies/${id}`, data),
    delete: (id: string) => this.delete(`/companies/${id}`),
    // Logo upload - POST /companies/{id}/logo/upload
    uploadLogo: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.postFormData(`/companies/${id}/logo/upload`, formData);
    },
  };

  // Department endpoints - Swagger: /api/havenzhub/departments
  departments = {
    getAll: () => this.get('/departments'),
    getById: (id: string) => this.get(`/departments/${id}`),
    getByCompany: (companyId: string) => this.get(`/departments/company/${companyId}`),
    search: (name: string) => this.get(`/departments/search/${encodeURIComponent(name)}`),
    create: (data: any) => this.post('/departments', data),
    update: (id: string, data: any) => this.put(`/departments/${id}`, data),
    delete: (id: string) => this.delete(`/departments/${id}`),
    // Member management - Swagger: /api/havenzhub/departments/{departmentId}/members
    addMember: (departmentId: string, data: any) => this.post(`/departments/${departmentId}/members`, data),
    getMembers: (departmentId: string) => this.get(`/departments/${departmentId}/members`),
    removeMember: (departmentId: string, userId: string) => this.delete(`/departments/${departmentId}/members/${userId}`),
    updateMemberRole: (departmentId: string, userId: string, data: any) => this.put(`/departments/${departmentId}/members/${userId}/role`, data),
  };

  // Project endpoints - Swagger: /api/havenzhub/projects
  projects = {
    getAll: () => this.get('/projects'),
    getById: (id: string) => this.get(`/projects/${id}`),
    getByStatus: (status: string) => this.get(`/projects/status/${status}`),
    getByCompany: (companyId: string) => this.get(`/projects/company/${companyId}`),
    getByPriority: (priority: string) => this.get(`/projects/priority/${priority}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/projects/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    create: (data: any) => this.post('/projects', data),
    update: (id: string, data: any) => this.put(`/projects/${id}`, data),
    delete: (id: string) => this.delete(`/projects/${id}`),
    // Member management - /api/havenzhub/projects/{projectId}/members
    addMember: (projectId: string, data: any) => this.post(`/projects/${projectId}/members`, data),
    getMembers: (projectId: string) => this.get(`/projects/${projectId}/members`),
    removeMember: (projectId: string, userId: string) => this.delete(`/projects/${projectId}/members/${userId}`),
    updateMemberRole: (projectId: string, userId: string, data: any) => this.put(`/projects/${projectId}/members/${userId}/role`, data),
    // Department assignments - /api/havenzhub/projects/{projectId}/departments
    assignDepartment: (projectId: string, departmentId: string) => this.post(`/projects/${projectId}/departments/${departmentId}`, {}),
    removeDepartment: (projectId: string, departmentId: string) => this.delete(`/projects/${projectId}/departments/${departmentId}`),
    getDepartments: (projectId: string) => this.get(`/projects/${projectId}/departments`),
  };

  // Property endpoints (Note: Not found in Swagger - may need backend update)
  properties = {
    getAll: () => this.get('/properties'),
    getById: (id: string) => this.get(`/properties/${id}`),
    getByCompany: (companyId: string) => this.get(`/properties/company/${companyId}`),
    getByType: (type: string) => this.get(`/properties/type/${type}`),
    getByStatus: (status: string) => this.get(`/properties/status/${status}`),
    getByLocation: (params: { city?: string; province?: string; country?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.get(`/properties/location?${query}`);
    },
    create: (data: any) => this.post('/properties', data),
    update: (id: string, data: any) => this.put(`/properties/${id}`, data),
    delete: (id: string) => this.delete(`/properties/${id}`),
  };

  // Document endpoints - Swagger: /api/havenzhub/documents
  documents = {
    getAll: () => this.get<DocumentDto[]>('/documents'),
    getById: (id: string) => this.get<DocumentDto>(`/documents/${id}`),
    getByCompany: (companyId: string) => this.get<DocumentDto[]>(`/documents/company/${companyId}`),
    getByStatus: (status: string) => this.get<DocumentDto[]>(`/documents/status/${status}`),
    getByUploader: (uploadedByUserId: string) => this.get<DocumentDto[]>(`/documents/uploader/${uploadedByUserId}`),
    getByCategory: (category: string) => this.get<DocumentDto[]>(`/documents/category/${category}`),
    getByAccessLevel: (accessLevel: string) => this.get<DocumentDto[]>(`/documents/accesslevel/${accessLevel}`),
    search: (name: string) => this.get<DocumentDto[]>(`/documents/search/${encodeURIComponent(name)}`),
    // Two-step upload: 1) upload file, 2) create document record
    upload: (data: FormData) => this.postFormData('/documents/upload', data),
    create: (data: any) => this.post<DocumentDto>('/documents', data),
    update: (id: string, data: any) => this.put<DocumentDto>(`/documents/${id}`, data),
    approve: (id: string) => this.post(`/documents/${id}/approve`, {}),
    reject: (id: string, data?: { reason?: string }) => this.post(`/documents/${id}/reject`, data || {}),
    delete: (id: string) => this.delete(`/documents/${id}`),
    // Get signed download URL for GCS-stored documents
    getDownloadUrl: (id: string) => this.get<DocumentDownloadResponse>(`/documents/${id}/download`),
    // Department assignment endpoints
    assignDepartment: (documentId: string, departmentId: string) =>
      this.post<DocumentDepartmentDto>(`/documents/${documentId}/departments/${departmentId}`, {}),
    removeDepartment: (documentId: string, departmentId: string) =>
      this.delete(`/documents/${documentId}/departments/${departmentId}`),
    getDepartments: (documentId: string) =>
      this.get<DocumentDepartmentDto[]>(`/documents/${documentId}/departments`),
    // User access endpoints
    grantUserAccess: (documentId: string, userId: string, accessLevel: string = 'view') =>
      this.post<DocumentUserAccessDto>(`/documents/${documentId}/users/${userId}?accessLevel=${accessLevel}`, {}),
    revokeUserAccess: (documentId: string, userId: string) =>
      this.delete(`/documents/${documentId}/users/${userId}`),
    getUsersWithAccess: (documentId: string) =>
      this.get<DocumentUserAccessDto[]>(`/documents/${documentId}/users`),
    // Access history
    getAccessHistory: (documentId: string) =>
      this.get<DocumentAccessLogDto[]>(`/documents/${documentId}/access-history`),
  };

  // Document Versions - /api/havenzhub/documents/{documentId}/versions
  documentVersions = {
    list: (documentId: string) =>
      this.get<DocumentVersionDto[]>(`/documents/${documentId}/versions`),
    get: (documentId: string, versionNumber: number) =>
      this.get<DocumentVersionDto>(`/documents/${documentId}/versions/${versionNumber}`),
    getCurrent: (documentId: string) =>
      this.get<DocumentVersionDto>(`/documents/${documentId}/versions/current`),
    download: (documentId: string, versionNumber: number) =>
      this.get<DocumentDownloadResponse>(`/documents/${documentId}/versions/${versionNumber}/download`),
    restore: (documentId: string, versionNumber: number, data?: RestoreVersionRequest) =>
      this.post<DocumentVersionDto>(`/documents/${documentId}/versions/${versionNumber}/restore`, data || {}),
  };

  // Document Check-out/Check-in - /api/havenzhub/documents/{documentId}/checkout
  documentCheckout = {
    checkout: (documentId: string, data?: CheckoutRequest) =>
      this.post<CheckoutOperationResponse>(`/documents/${documentId}/checkout`, data || {}),
    checkin: (documentId: string, data: CheckinRequest) =>
      this.post<CheckoutOperationResponse>(`/documents/${documentId}/checkin`, data),
    getStatus: (documentId: string) =>
      this.get<CheckoutStatusDto>(`/documents/${documentId}/checkout/status`),
    cancel: (documentId: string) =>
      this.post<CheckoutOperationResponse>(`/documents/${documentId}/checkout/cancel`, {}),
    forceCancel: (documentId: string, data: ForceCheckoutCancelRequest) =>
      this.post<CheckoutOperationResponse>(`/documents/${documentId}/checkout/force`, data),
  };

  // Document Sharing - /api/havenzhub/documents/{documentId}/shares
  documentShares = {
    list: (documentId: string) =>
      this.get<DocumentShareDto[]>(`/documents/${documentId}/shares`),
    create: (documentId: string, data: CreateDocumentShareRequest) =>
      this.post<DocumentShareDto>(`/documents/${documentId}/shares`, data),
    get: (documentId: string, shareId: string) =>
      this.get<DocumentShareDto>(`/documents/${documentId}/shares/${shareId}`),
    update: (documentId: string, shareId: string, data: UpdateDocumentShareRequest) =>
      this.put<DocumentShareDto>(`/documents/${documentId}/shares/${shareId}`, data),
    revoke: (documentId: string, shareId: string) =>
      this.delete(`/documents/${documentId}/shares/${shareId}`),
    getLogs: (documentId: string, shareId: string) =>
      this.get<ShareAccessLogDto[]>(`/documents/${documentId}/shares/${shareId}/logs`),
  };

  // Document Permissions - /api/havenzhub/documents/{documentId}/permissions
  documentPermissions = {
    list: (documentId: string) =>
      this.get<DocumentPermissionDto[]>(`/documents/${documentId}/permissions`),
    create: (documentId: string, data: CreateDocumentPermissionRequest) =>
      this.post<DocumentPermissionDto>(`/documents/${documentId}/permissions`, data),
    get: (documentId: string, permissionId: string) =>
      this.get<DocumentPermissionDto>(`/documents/${documentId}/permissions/${permissionId}`),
    update: (documentId: string, permissionId: string, data: UpdateDocumentPermissionRequest) =>
      this.put<DocumentPermissionDto>(`/documents/${documentId}/permissions/${permissionId}`, data),
    revoke: (documentId: string, permissionId: string) =>
      this.delete(`/documents/${documentId}/permissions/${permissionId}`),
    getEffective: (documentId: string) =>
      this.get<EffectivePermissionsDto>(`/documents/${documentId}/permissions/effective`),
    getUserEffective: (documentId: string, userId: string) =>
      this.get<EffectivePermissionsDto>(`/documents/${documentId}/permissions/effective/${userId}`),
  };

  // Document Workflows - /api/havenzhub/documents/{documentId}/workflow
  documentWorkflows = {
    start: (documentId: string, data?: StartWorkflowRequest) =>
      this.post<WorkflowInstanceDto>(`/documents/${documentId}/workflow/start`, data || {}),
    getStatus: (documentId: string) =>
      this.get<WorkflowInstanceDto>(`/documents/${documentId}/workflow`),
    getInstance: (documentId: string, instanceId: string) =>
      this.get<WorkflowInstanceDto>(`/documents/${documentId}/workflow/${instanceId}`),
    getHistory: (documentId: string) =>
      this.get<WorkflowInstanceDto[]>(`/documents/${documentId}/workflow/history`),
    cancel: (documentId: string, data: CancelWorkflowRequest) =>
      this.post<WorkflowInstanceDto>(`/documents/${documentId}/workflow/cancel`, data),
  };

  // Recent & Favorites - /api/havenzhub/documents/recent, /favorites
  documentRecent = {
    getRecent: () =>
      this.get<RecentDocumentDto[]>('/documents/recent'),
    getFavorites: () =>
      this.get<FavoriteDocumentDto[]>('/documents/favorites'),
    addFavorite: (documentId: string) =>
      this.post<FavoriteDocumentDto>(`/documents/${documentId}/favorite`, {}),
    removeFavorite: (documentId: string) =>
      this.delete(`/documents/${documentId}/favorite`),
    reorderFavorites: (data: UpdateFavoriteOrderRequest) =>
      this.put('/documents/favorites/order', data),
  };

  // Document Search & Discovery
  documentSearch = {
    search: (data: DocumentSearchRequest) =>
      this.post<DocumentSearchResults>('/documents/search', data),
    searchGet: (params: DocumentSearchRequest) => {
      const query = new URLSearchParams();
      if (params.query) query.append('query', params.query);
      if (params.documentTypeIds) params.documentTypeIds.forEach(id => query.append('DocumentTypeIds', id));
      if (params.classifications) params.classifications.forEach(c => query.append('Classifications', c));
      if (params.categories) params.categories.forEach(c => query.append('Categories', c));
      if (params.dateFrom) query.append('DateFrom', params.dateFrom);
      if (params.dateTo) query.append('DateTo', params.dateTo);
      if (params.folderId) query.append('FolderId', params.folderId);
      if (params.includeSubfolders !== undefined) query.append('IncludeSubfolders', String(params.includeSubfolders));
      if (params.projectId) query.append('ProjectId', params.projectId);
      if (params.departmentId) query.append('DepartmentId', params.departmentId);
      if (params.propertyId) query.append('PropertyId', params.propertyId);
      if (params.status) query.append('Status', params.status);
      if (params.ownedByUserId) query.append('OwnedByUserId', params.ownedByUserId);
      if (params.uploadedByUserId) query.append('UploadedByUserId', params.uploadedByUserId);
      if (params.sortBy) query.append('SortBy', params.sortBy);
      if (params.sortDirection) query.append('SortDirection', params.sortDirection);
      if (params.page) query.append('Page', String(params.page));
      if (params.pageSize) query.append('PageSize', String(params.pageSize));
      return this.get<DocumentSearchResults>(`/documents/search?${query.toString()}`);
    },
    getCheckedOut: () =>
      this.get<CheckedOutDocumentDto[]>('/documents/checked-out'),
    getMyCheckouts: () =>
      this.get<CheckedOutDocumentDto[]>('/documents/my-checkouts'),
    getNeedsReview: () =>
      this.get<DocumentNeedsReviewDto[]>('/documents/needs-review'),
  };

  // Document Retention - /api/havenzhub/documents/{documentId}/retention
  documentRetention = {
    getSchedules: (documentId: string) =>
      this.get<RetentionScheduleDto[]>(`/documents/${documentId}/retention/schedules`),
    extendSchedule: (documentId: string, scheduleId: string, data: ExtendRetentionRequest) =>
      this.post<RetentionScheduleDto>(`/documents/${documentId}/retention/schedules/${scheduleId}/extend`, data),
    setLegalHold: (documentId: string, data: LegalHoldRequest) =>
      this.post(`/documents/${documentId}/retention/legal-hold`, data),
    applyPolicy: (documentId: string, policyId: string) =>
      this.post(`/documents/${documentId}/retention/apply-policy/${policyId}`, {}),
  };

  // Workflow Tasks - /api/havenzhub/workflow-tasks
  workflowTasks = {
    getMyTasks: () =>
      this.get<WorkflowTaskDto[]>('/workflow-tasks?pendingOnly=true'),
    getPendingTasks: () =>
      this.get<WorkflowTaskDto[]>('/workflow-tasks?pendingOnly=true'),
    getAllTasks: (pendingOnly: boolean = true) =>
      this.get<WorkflowTaskDto[]>(`/workflow-tasks?pendingOnly=${pendingOnly}`),
    getByRole: (role: string, pendingOnly: boolean = true) =>
      this.get<WorkflowTaskDto[]>(`/workflow-tasks/by-role/${role}?pendingOnly=${pendingOnly}`),
    getTask: (taskId: string) =>
      this.get<WorkflowTaskDto>(`/workflow-tasks/${taskId}`),
    complete: (taskId: string, data: CompleteTaskRequest) =>
      this.post<WorkflowTaskDto>(`/workflow-tasks/${taskId}/complete`, data),
    delegate: (taskId: string, data: DelegateTaskRequest) =>
      this.post<WorkflowTaskDto>(`/workflow-tasks/${taskId}/delegate`, data),
  };

  // Admin APIs - /api/havenzhub/admin
  admin = {
    // Document Types - /api/havenzhub/admin/document-types
    documentTypes: {
      list: (includeInactive: boolean = false) =>
        this.get<DocumentTypeDto[]>(`/admin/document-types?includeInactive=${includeInactive}`),
      create: (data: CreateDocumentTypeRequest) =>
        this.post<DocumentTypeDto>('/admin/document-types', data),
      get: (id: string) =>
        this.get<DocumentTypeDto>(`/admin/document-types/${id}`),
      getByCode: (code: string) =>
        this.get<DocumentTypeDto>(`/admin/document-types/by-code/${code}`),
      update: (id: string, data: UpdateDocumentTypeRequest) =>
        this.put<DocumentTypeDto>(`/admin/document-types/${id}`, data),
      delete: (id: string) =>
        this.delete(`/admin/document-types/${id}`),
      validate: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return this.postFormData<FileValidationResult>(`/admin/document-types/${id}/validate`, formData);
      },
    },

    // Folder Templates - /api/havenzhub/admin/folder-templates
    folderTemplates: {
      list: (includeInactive: boolean = false) =>
        this.get<FolderTemplateDto[]>(`/admin/folder-templates?includeInactive=${includeInactive}`),
      create: (data: CreateFolderTemplateRequest) =>
        this.post<FolderTemplateDto>('/admin/folder-templates', data),
      get: (id: string) =>
        this.get<FolderTemplateDto>(`/admin/folder-templates/${id}`),
      getByCode: (code: string) =>
        this.get<FolderTemplateDto>(`/admin/folder-templates/by-code/${code}`),
      update: (id: string, data: UpdateFolderTemplateRequest) =>
        this.put<FolderTemplateDto>(`/admin/folder-templates/${id}`, data),
      delete: (id: string) =>
        this.delete(`/admin/folder-templates/${id}`),
      getForScope: (scopeType: string) =>
        this.get<FolderTemplateDto[]>(`/admin/folder-templates/for-scope/${scopeType}`),
      getDefault: (scopeType: string) =>
        this.get<FolderTemplateDto>(`/admin/folder-templates/default/${scopeType}`),
      getApplications: (id: string) =>
        this.get<FolderTemplateApplicationDto[]>(`/admin/folder-templates/${id}/applications`),
    },

    // Retention Policies - /api/havenzhub/admin/retention-policies
    retentionPolicies: {
      list: (includeInactive: boolean = false) =>
        this.get<RetentionPolicyDto[]>(`/admin/retention-policies?includeInactive=${includeInactive}`),
      create: (data: CreateRetentionPolicyRequest) =>
        this.post<RetentionPolicyDto>('/admin/retention-policies', data),
      get: (id: string) =>
        this.get<RetentionPolicyDto>(`/admin/retention-policies/${id}`),
      getByCode: (code: string) =>
        this.get<RetentionPolicyDto>(`/admin/retention-policies/by-code/${code}`),
      update: (id: string, data: UpdateRetentionPolicyRequest) =>
        this.put<RetentionPolicyDto>(`/admin/retention-policies/${id}`, data),
      delete: (id: string) =>
        this.delete(`/admin/retention-policies/${id}`),
    },

    // Workflows - /api/havenzhub/admin/workflows
    workflows: {
      list: (includeInactive: boolean = false) =>
        this.get<WorkflowDto[]>(`/admin/workflows?includeInactive=${includeInactive}`),
      create: (data: CreateWorkflowRequest) =>
        this.post<WorkflowDto>('/admin/workflows', data),
      get: (id: string) =>
        this.get<WorkflowDto>(`/admin/workflows/${id}`),
      getByCode: (code: string) =>
        this.get<WorkflowDto>(`/admin/workflows/by-code/${code}`),
      update: (id: string, data: UpdateWorkflowRequest) =>
        this.put<WorkflowDto>(`/admin/workflows/${id}`, data),
      delete: (id: string) =>
        this.delete(`/admin/workflows/${id}`),
      getDefault: () =>
        this.get<WorkflowDto>('/admin/workflows/default'),
      // Note: activate/deactivate endpoints not in swagger - workflows are activated via isActive field in update
    },
  };

  // Folder endpoints - Swagger: /api/havenzhub/folders
  folders = {
    getAll: () => this.get('/folders'),
    getTree: () => this.get('/folders/tree'),
    getById: (id: string) => this.get(`/folders/${id}`),
    getDocuments: (id: string) => this.get<DocumentDto[]>(`/folders/${id}/documents`),
    create: (data: any) => this.post('/folders', data),
    update: (id: string, data: any) => this.put(`/folders/${id}`, data),
    delete: (id: string, cascade?: boolean) => this.delete(`/folders/${id}${cascade ? '?cascade=true' : ''}`),
    // Folder Templates
    createFromTemplate: (data: ApplyFolderTemplateRequest) =>
      this.post<FolderTemplateApplicationDto>('/folders/from-template', data),
    applyTemplate: (scopeType: string, scopeId: string) =>
      this.post<FolderTemplateApplicationDto>(`/folders/template-application/${scopeType}/${scopeId}`, {}),
    // Folder Permissions
    getPermissions: (folderId: string) =>
      this.get<DocumentPermissionDto[]>(`/folders/${folderId}/permissions`),
    createPermission: (folderId: string, data: CreateDocumentPermissionRequest) =>
      this.post<DocumentPermissionDto>(`/folders/${folderId}/permissions`, data),
    getPermission: (folderId: string, permissionId: string) =>
      this.get<DocumentPermissionDto>(`/folders/${folderId}/permissions/${permissionId}`),
    updatePermission: (folderId: string, permissionId: string, data: UpdateDocumentPermissionRequest) =>
      this.put<DocumentPermissionDto>(`/folders/${folderId}/permissions/${permissionId}`, data),
    deletePermission: (folderId: string, permissionId: string) =>
      this.delete(`/folders/${folderId}/permissions/${permissionId}`),
  };

  // BMS Device endpoints - Swagger: /api/havenzhub/BmsDevice
  bmsDevices = {
    getAll: () => this.get('/BmsDevice'),
    getById: (id: string) => this.get(`/BmsDevice/${id}`),
    getByProperty: (propertyId: string) => this.get(`/BmsDevice/property/${propertyId}`),
    getByType: (type: string) => this.get(`/BmsDevice/type/${type}`),
    getByStatus: (status: string) => this.get(`/BmsDevice/status/${status}`),
    getByCompany: (companyId: string) => this.get(`/BmsDevice/company/${companyId}`),
    getMaintenanceRequired: () => this.get('/BmsDevice/maintenance/required'),
    create: (data: any) => this.post('/BmsDevice', data),
    update: (id: string, data: any) => this.put(`/BmsDevice/${id}`, data),
    delete: (id: string) => this.delete(`/BmsDevice/${id}`),
  };

  // Access Log endpoints - Swagger: /api/havenzhub/AccessLog
  accessLogs = {
    getAll: () => this.get('/AccessLog'),
    getById: (id: number) => this.get(`/AccessLog/${id}`),
    getByUser: (userId: string) => this.get(`/AccessLog/user/${userId}`),
    getByProperty: (propertyId: string) => this.get(`/AccessLog/property/${propertyId}`),
    getByDevice: (deviceId: string) => this.get(`/AccessLog/device/${deviceId}`),
    getByCompany: (companyId: string) => this.get(`/AccessLog/company/${companyId}`),
    getByType: (accessType: string) => this.get(`/AccessLog/type/${accessType}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/AccessLog/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    getAnomalous: () => this.get('/AccessLog/anomalous'),
    getDenied: () => this.get('/AccessLog/denied'),
    create: (data: any) => this.post('/AccessLog', data),
    update: (id: number, data: any) => this.put(`/AccessLog/${id}`, data),
    delete: (id: number) => this.delete(`/AccessLog/${id}`),
  };

  // IoT Metric endpoints - Swagger: /api/havenzhub/IotMetric
  iotMetrics = {
    getAll: () => this.get('/IotMetric'),
    getById: (id: number) => this.get(`/IotMetric/${id}`),
    getByDevice: (deviceId: string) => this.get(`/IotMetric/device/${deviceId}`),
    getByProperty: (propertyId: string) => this.get(`/IotMetric/property/${propertyId}`),
    getByCompany: (companyId: string) => this.get(`/IotMetric/company/${companyId}`),
    getByType: (metricType: string) => this.get(`/IotMetric/type/${metricType}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/IotMetric/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    getAlerts: () => this.get('/IotMetric/alerts'),
    getBySeverity: (severity: string) => this.get(`/IotMetric/severity/${severity}`),
    create: (data: any) => this.post('/IotMetric', data),
    update: (id: number, data: any) => this.put(`/IotMetric/${id}`, data),
    delete: (id: number) => this.delete(`/IotMetric/${id}`),
  };

  // Facial Recognition endpoints - Swagger: /api/havenzhub/FacialRecognition
  facialRecognition = {
    getAll: () => this.get('/FacialRecognition'),
    getById: (id: string) => this.get(`/FacialRecognition/${id}`),
    getByUser: (userId: string) => this.get(`/FacialRecognition/user/${userId}`),
    getByCompany: (companyId: string) => this.get(`/FacialRecognition/company/${companyId}`),
    getByStatus: (status: string) => this.get(`/FacialRecognition/status/${status}`),
    getExpired: () => this.get('/FacialRecognition/expired'),
    create: (data: any) => this.post('/FacialRecognition', data),
    update: (id: string, data: any) => this.put(`/FacialRecognition/${id}`, data),
    delete: (id: string) => this.delete(`/FacialRecognition/${id}`),
  };

  // Task endpoints - Swagger: /api/havenzhub/tasks
  tasks = {
    // GET /tasks - paginated with filters
    getAll: (params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      priority?: string;
      projectId?: string;
      departmentId?: string;
      propertyId?: string;
      assignedToUserId?: string;
      createdByUserId?: string;
      search?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params?.status) query.append('status', params.status);
      if (params?.priority) query.append('priority', params.priority);
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.departmentId) query.append('departmentId', params.departmentId);
      if (params?.propertyId) query.append('propertyId', params.propertyId);
      if (params?.assignedToUserId) query.append('assignedToUserId', params.assignedToUserId);
      if (params?.createdByUserId) query.append('createdByUserId', params.createdByUserId);
      if (params?.search) query.append('search', params.search);
      const queryString = query.toString();
      return this.get(`/tasks${queryString ? `?${queryString}` : ''}`);
    },
    // GET /tasks/{id}
    getById: (id: string) => this.get(`/tasks/${id}`),
    // GET /tasks/my-tasks - current user's assigned tasks
    getMyTasks: (status?: string) => {
      const query = status ? `?status=${status}` : '';
      return this.get(`/tasks/my-tasks${query}`);
    },
    // GET /tasks/project/{projectId}
    getByProject: (projectId: string) => this.get(`/tasks/project/${projectId}`),
    // POST /tasks - create new task
    create: (data: any) => this.post('/tasks', data),
    // PUT /tasks/{id} - full update (admin, dept_manager, project_lead only)
    update: (id: string, data: any) => this.put(`/tasks/${id}`, data),
    // PATCH /tasks/{id}/status/{status} - update status only (employees can use this)
    updateStatus: (id: string, status: string) => this.request(`/tasks/${id}/status/${status}`, { method: 'PATCH' }),
    // PATCH /tasks/{id}/assign/{userId?} - assign/unassign task
    assign: (id: string, userId?: string) => {
      const endpoint = userId ? `/tasks/${id}/assign/${userId}` : `/tasks/${id}/assign`;
      return this.request(endpoint, { method: 'PATCH' });
    },
    // DELETE /tasks/{id} - soft delete
    delete: (id: string) => this.delete(`/tasks/${id}`),
  };

  // Expense endpoints - Swagger: /api/havenzhub/expenses
  expenses = {
    // GET /expenses/project/{projectId} - List expenses for a project with filters
    getByProject: (
      projectId: string,
      params?: {
        page?: number;
        pageSize?: number;
        status?: string;
        category?: string;
        sortBy?: string;
        descending?: boolean;
      }
    ) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params?.status) query.append('status', params.status);
      if (params?.category) query.append('category', params.category);
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.descending !== undefined) query.append('descending', params.descending.toString());
      const queryString = query.toString();
      return this.get<ExpenseDtoPagedResult>(`/expenses/project/${projectId}${queryString ? `?${queryString}` : ''}`);
    },

    // GET /expenses/{id} - Get single expense
    getById: (id: string) => this.get<ExpenseDto>(`/expenses/${id}`),

    // POST /expenses - Submit new expense
    create: (data: CreateExpenseRequest) => this.post<ExpenseDto>('/expenses', data),

    // PUT /expenses/{id} - Update pending expense (submitter only)
    update: (id: string, data: UpdateExpenseRequest) => this.put<ExpenseDto>(`/expenses/${id}`, data),

    // DELETE /expenses/{id} - Delete pending expense (submitter only)
    delete: (id: string) => this.delete(`/expenses/${id}`),

    // POST /expenses/{id}/invoice - Upload invoice file
    uploadInvoice: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.postFormData<ExpenseDto>(`/expenses/${id}/invoice`, formData);
    },

    // GET /expenses/{id}/invoice - Get invoice download URL
    getInvoiceUrl: (id: string) => this.get<InvoiceDownloadResponse>(`/expenses/${id}/invoice`),

    // POST /expenses/{id}/approve - Approve expense (admin only)
    approve: (id: string) => this.post<ExpenseActionResponse>(`/expenses/${id}/approve`, {}),

    // POST /expenses/{id}/reject - Reject expense with reason (admin only)
    reject: (id: string, data: RejectExpenseRequest) => this.post<ExpenseActionResponse>(`/expenses/${id}/reject`, data),

    // GET /expenses/pending - List all pending expenses (admin only)
    getPending: (params?: {
      page?: number;
      pageSize?: number;
      projectId?: string;
      category?: string;
      sortBy?: string;
      descending?: boolean;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.category) query.append('category', params.category);
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.descending !== undefined) query.append('descending', params.descending.toString());
      const queryString = query.toString();
      return this.get<ExpenseDtoPagedResult>(`/expenses/pending${queryString ? `?${queryString}` : ''}`);
    },

    // GET /expenses/project/{projectId}/summary - Get expense summary for a project
    getSummary: (projectId: string) => this.get<ProjectExpenseSummary>(`/expenses/project/${projectId}/summary`),
  };

  // Notification endpoints - Swagger: /api/havenzhub/notifications
  notifications = {
    // GET /notifications - Get notifications for current user
    getAll: (params?: {
      page?: number;
      pageSize?: number;
      unreadOnly?: boolean;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params?.unreadOnly !== undefined) query.append('unreadOnly', params.unreadOnly.toString());
      const queryString = query.toString();
      return this.get<NotificationDtoPagedResult>(`/notifications${queryString ? `?${queryString}` : ''}`);
    },

    // GET /notifications/unread-count - Get unread notification count
    getUnreadCount: () => this.get<UnreadCountResponse>('/notifications/unread-count'),

    // PATCH /notifications/{id}/read - Mark notification as read
    markAsRead: (id: string) => this.request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),

    // PATCH /notifications/read-all - Mark all notifications as read
    markAllAsRead: () => this.request<void>('/notifications/read-all', { method: 'PATCH' }),

    // POST /notifications/device-token - Register device for push notifications
    registerDeviceToken: (data: RegisterDeviceTokenRequest) =>
      this.post<void>('/notifications/device-token', data),

    // DELETE /notifications/device-token/{token} - Remove device token
    removeDeviceToken: (token: string) =>
      this.delete<void>(`/notifications/device-token/${encodeURIComponent(token)}`),
  };
}

// Export singleton instance
export const bmsApi = new BmsApiService();
export { BmsApiError };
