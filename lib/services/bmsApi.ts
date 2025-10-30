import { ApiResponse, ApiError } from '@/types/bms';

const BASE_URL = process.env.NEXT_PUBLIC_BMS_API_BASE_URL || 'http://localhost:5000';
const API_PREFIX = '/api/havenzhub';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

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

  constructor(baseUrl: string = BASE_URL) {
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

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!skipAuth && this.companyId) {
      headers['X-Company-Id'] = this.companyId;
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

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json() : { message: response.statusText };
        throw new BmsApiError(
          errorData.message || 'API request failed',
          response.status,
          errorData.code,
          errorData.details
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

  // User endpoints
  users = {
    getAll: () => this.get('/user'),
    getById: (id: string) => this.get(`/user/${id}`),
    getByEmail: (email: string) => this.get(`/user/email/${encodeURIComponent(email)}`),
    getByCompany: (companyId: string) => this.get(`/user/company/${companyId}`),
    create: (data: any) => this.post('/user', data),
    update: (id: string, data: any) => this.put(`/user/${id}`, data),
    delete: (id: string) => this.delete(`/user/${id}`),
  };

  // Company endpoints
  companies = {
    getAll: () => this.get('/company'),
    getById: (id: string) => this.get(`/company/${id}`),
    getByStatus: (status: string) => this.get(`/company/status/${status}`),
    getByUser: (userId: string) => this.get(`/company/user/${userId}`),
    getByIndustry: (industry: string) => this.get(`/company/industry/${encodeURIComponent(industry)}`),
    create: (data: any) => this.post('/company', data),
    update: (id: string, data: any) => this.put(`/company/${id}`, data),
    delete: (id: string) => this.delete(`/company/${id}`),
  };

  // Department endpoints
  departments = {
    getAll: () => this.get('/department'),
    getById: (id: string) => this.get(`/department/${id}`),
    getByCompany: (companyId: string) => this.get(`/department/company/${companyId}`),
    search: (name: string) => this.get(`/department/search/${encodeURIComponent(name)}`),
    create: (data: any) => this.post('/department', data),
    update: (id: string, data: any) => this.put(`/department/${id}`, data),
    delete: (id: string) => this.delete(`/department/${id}`),
  };

  // Project endpoints
  projects = {
    getAll: () => this.get('/project'),
    getById: (id: string) => this.get(`/project/${id}`),
    getByStatus: (status: string) => this.get(`/project/status/${status}`),
    getByCompany: (companyId: string) => this.get(`/project/company/${companyId}`),
    getByPriority: (priority: string) => this.get(`/project/priority/${priority}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/project/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    create: (data: any) => this.post('/project', data),
    update: (id: string, data: any) => this.put(`/project/${id}`, data),
    delete: (id: string) => this.delete(`/project/${id}`),
  };

  // Property endpoints
  properties = {
    getAll: () => this.get('/property'),
    getById: (id: string) => this.get(`/property/${id}`),
    getByCompany: (companyId: string) => this.get(`/property/company/${companyId}`),
    getByType: (type: string) => this.get(`/property/type/${type}`),
    getByStatus: (status: string) => this.get(`/property/status/${status}`),
    getByLocation: (params: { city?: string; province?: string; country?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.get(`/property/location?${query}`);
    },
    create: (data: any) => this.post('/property', data),
    update: (id: string, data: any) => this.put(`/property/${id}`, data),
    delete: (id: string) => this.delete(`/property/${id}`),
  };

  // Document endpoints
  documents = {
    getAll: () => this.get('/document'),
    getById: (id: string) => this.get(`/document/${id}`),
    getByCompany: (companyId: string) => this.get(`/document/company/${companyId}`),
    getByStatus: (status: string) => this.get(`/document/status/${status}`),
    getByUploader: (uploadedByUserId: string) => this.get(`/document/uploader/${uploadedByUserId}`),
    getByCategory: (category: string) => this.get(`/document/category/${category}`),
    getByAccessLevel: (accessLevel: string) => this.get(`/document/accesslevel/${accessLevel}`),
    search: (name: string) => this.get(`/document/search/${encodeURIComponent(name)}`),
    create: (data: any) => this.post('/document', data),
    update: (id: string, data: any) => this.put(`/document/${id}`, data),
    softDelete: (id: string) => this.delete(`/document/${id}`),
    hardDelete: (id: string) => this.delete(`/document/${id}/hard`),
  };

  // BMS Device endpoints
  bmsDevices = {
    getAll: () => this.get('/bmsdevice'),
    getById: (id: string) => this.get(`/bmsdevice/${id}`),
    getByProperty: (propertyId: string) => this.get(`/bmsdevice/property/${propertyId}`),
    getByType: (type: string) => this.get(`/bmsdevice/type/${type}`),
    getByStatus: (status: string) => this.get(`/bmsdevice/status/${status}`),
    getByCompany: (companyId: string) => this.get(`/bmsdevice/company/${companyId}`),
    getMaintenanceRequired: () => this.get('/bmsdevice/maintenance/required'),
    create: (data: any) => this.post('/bmsdevice', data),
    update: (id: string, data: any) => this.put(`/bmsdevice/${id}`, data),
    delete: (id: string) => this.delete(`/bmsdevice/${id}`),
  };

  // Access Log endpoints
  accessLogs = {
    getAll: () => this.get('/accesslog'),
    getById: (id: number) => this.get(`/accesslog/${id}`),
    getByUser: (userId: string) => this.get(`/accesslog/user/${userId}`),
    getByProperty: (propertyId: string) => this.get(`/accesslog/property/${propertyId}`),
    getByDevice: (deviceId: string) => this.get(`/accesslog/device/${deviceId}`),
    getByCompany: (companyId: string) => this.get(`/accesslog/company/${companyId}`),
    getByType: (accessType: string) => this.get(`/accesslog/type/${accessType}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/accesslog/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    getAnomalous: () => this.get('/accesslog/anomalous'),
    getDenied: () => this.get('/accesslog/denied'),
    create: (data: any) => this.post('/accesslog', data),
    update: (id: number, data: any) => this.put(`/accesslog/${id}`, data),
    delete: (id: number) => this.delete(`/accesslog/${id}`),
  };

  // IoT Metric endpoints
  iotMetrics = {
    getAll: () => this.get('/iotmetric'),
    getById: (id: number) => this.get(`/iotmetric/${id}`),
    getByDevice: (deviceId: string) => this.get(`/iotmetric/device/${deviceId}`),
    getByProperty: (propertyId: string) => this.get(`/iotmetric/property/${propertyId}`),
    getByCompany: (companyId: string) => this.get(`/iotmetric/company/${companyId}`),
    getByType: (metricType: string) => this.get(`/iotmetric/type/${metricType}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/iotmetric/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    getAlerts: () => this.get('/iotmetric/alerts'),
    getBySeverity: (severity: string) => this.get(`/iotmetric/severity/${severity}`),
    create: (data: any) => this.post('/iotmetric', data),
    update: (id: number, data: any) => this.put(`/iotmetric/${id}`, data),
    delete: (id: number) => this.delete(`/iotmetric/${id}`),
  };

  // Facial Recognition endpoints
  facialRecognition = {
    getAll: () => this.get('/facialrecognition'),
    getById: (id: string) => this.get(`/facialrecognition/${id}`),
    getByUser: (userId: string) => this.get(`/facialrecognition/user/${userId}`),
    getByCompany: (companyId: string) => this.get(`/facialrecognition/company/${companyId}`),
    getByStatus: (status: string) => this.get(`/facialrecognition/status/${status}`),
    getExpired: () => this.get('/facialrecognition/expired'),
    create: (data: any) => this.post('/facialrecognition', data),
    update: (id: string, data: any) => this.put(`/facialrecognition/${id}`, data),
    delete: (id: string) => this.delete(`/facialrecognition/${id}`),
  };
}

// Export singleton instance
export const bmsApi = new BmsApiService();
export { BmsApiError };
