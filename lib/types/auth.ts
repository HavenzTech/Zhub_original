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
  refreshToken?: string | null
  userId: string
  email: string
  name: string
  pictureUrl?: string | null
  companies: Company[]
  expiresAt: string
  // Multi-level access control fields (optional - backend may not return these)
  departmentIds?: string[]
  currentProjectId?: string | null
  // Required actions for first-time login flow
  requiredActions?: string[]
  requiresPasswordChange?: boolean
  requiresMfaSetup?: boolean
  // MFA challenge response (when MFA is enabled but code not provided)
  requiresMfa?: boolean
}

export interface LoginRequest {
  email: string
  password: string
  totpCode?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface MfaSetupResponse {
  secret: string
  qrCodeUri: string
  message: string
}

export interface VerifyMfaRequest {
  code: string
}

export interface AuthState {
  token: string | null
  refreshToken?: string | null
  userId: string | null
  email: string | null
  name: string | null
  pictureUrl?: string | null
  companies: Company[]
  currentCompanyId: string | null
  expiresAt: string | null
  // Multi-level access control fields
  departmentIds?: string[]
  currentProjectId?: string | null
  // Required actions for first-time login flow
  requiredActions?: string[]
  requiresPasswordChange?: boolean
  requiresMfaSetup?: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}
