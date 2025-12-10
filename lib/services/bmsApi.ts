import { ApiResponse, ApiError, DocumentDownloadResponse } from '@/types/bms';

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
    const { timeout = TIMEOUT, skipAuth = false, ...fetchOptions } = options;

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
        const errorData = isJson ? await response.json() : { message: response.statusText };
        throw new BmsApiError(
          errorData.message || 'API request failed',
          response.status,
          errorData.code,
          errorData.details
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
    const { timeout = TIMEOUT, skipAuth = false, ...fetchOptions } = options || {};
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
    getAll: () => this.get('/documents'),
    getById: (id: string) => this.get(`/documents/${id}`),
    getByCompany: (companyId: string) => this.get(`/documents/company/${companyId}`),
    getByStatus: (status: string) => this.get(`/documents/status/${status}`),
    getByUploader: (uploadedByUserId: string) => this.get(`/documents/uploader/${uploadedByUserId}`),
    getByCategory: (category: string) => this.get(`/documents/category/${category}`),
    getByAccessLevel: (accessLevel: string) => this.get(`/documents/accesslevel/${accessLevel}`),
    search: (name: string) => this.get(`/documents/search/${encodeURIComponent(name)}`),
    // Two-step upload: 1) upload file, 2) create document record
    upload: (data: FormData) => this.postFormData('/documents/upload', data),
    create: (data: any) => this.post('/documents', data),
    update: (id: string, data: any) => this.put(`/documents/${id}`, data),
    approve: (id: string) => this.post(`/documents/${id}/approve`, {}),
    reject: (id: string) => this.post(`/documents/${id}/reject`, {}),
    delete: (id: string) => this.delete(`/documents/${id}`),
    // Get signed download URL for GCS-stored documents
    getDownloadUrl: (id: string) => this.get<DocumentDownloadResponse>(`/documents/${id}/download`),
    // Department assignment endpoints
    assignDepartment: (documentId: string, departmentId: string) =>
      this.post(`/documents/${documentId}/departments/${departmentId}`, {}),
    removeDepartment: (documentId: string, departmentId: string) =>
      this.delete(`/documents/${documentId}/departments/${departmentId}`),
    getDepartments: (documentId: string) =>
      this.get(`/documents/${documentId}/departments`),
    // User access endpoints
    grantUserAccess: (documentId: string, userId: string, accessLevel: string = 'view') =>
      this.post(`/documents/${documentId}/users/${userId}?accessLevel=${accessLevel}`, {}),
    revokeUserAccess: (documentId: string, userId: string) =>
      this.delete(`/documents/${documentId}/users/${userId}`),
    getUsersWithAccess: (documentId: string) =>
      this.get(`/documents/${documentId}/users`),
  };

  // Folder endpoints - Swagger: /api/havenzhub/folders
  folders = {
    getAll: () => this.get('/folders'),
    getTree: () => this.get('/folders/tree'),
    getById: (id: string) => this.get(`/folders/${id}`),
    getChildren: (id: string) => this.get(`/folders/${id}/children`),
    getDocuments: (id: string) => this.get(`/folders/${id}/documents`),
    create: (data: any) => this.post('/folders', data),
    update: (id: string, data: any) => this.put(`/folders/${id}`, data),
    delete: (id: string, cascade?: boolean) => this.delete(`/folders/${id}${cascade ? '?cascade=true' : ''}`),
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
}

// Export singleton instance
export const bmsApi = new BmsApiService();
export { BmsApiError };
