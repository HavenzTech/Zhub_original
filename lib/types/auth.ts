// Auth API types based on backend response structure

// New role hierarchy:
// super_admin - Global access to all companies and features
// admin - Full access within company
// dept_manager - Manage assigned departments + view company
// project_lead - Manage assigned projects + view company
// employee - View + work on assigned tasks only
export type UserRole = 'super_admin' | 'admin' | 'dept_manager' | 'project_lead' | 'employee'

export interface Company {
  companyId: string
  companyName: string
  role: UserRole
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
