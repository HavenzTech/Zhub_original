// Auth API types based on backend response structure

export interface Company {
  companyId: string
  companyName: string
  role: 'admin' | 'member' | 'viewer'
}

export interface LoginResponse {
  token: string
  userId: string
  email: string
  name: string
  companies: Company[]
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  name: string | null
  companies: Company[]
  currentCompanyId: string | null
  expiresAt: string | null
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}
