// Auth service for API calls
import type {
  LoginRequest,
  LoginResponse,
  AuthState,
  ApiError,
  UserRole,
} from "@/lib/types/auth";

// Environment variables - configured in .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    const data: LoginResponse = await response.json();
    return data;
  }

  /**
   * Store auth data in localStorage and cookies
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
      // Multi-level access control fields
      departmentIds: authData.departmentIds || [],
      currentProjectId: authData.currentProjectId || null,
    };

    // Store in localStorage for client-side access
    localStorage.setItem("auth", JSON.stringify(authState));

    // Also store token in cookie for server-side middleware access
    if (typeof document !== "undefined") {
      const expiresDate = authData.expiresAt
        ? new Date(authData.expiresAt)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

      document.cookie = `auth-token=${authData.token}; path=/; expires=${expiresDate.toUTCString()}; SameSite=Lax`;
    }
  }

  /**
   * Get stored auth data
   */
  getAuth(): AuthState | null {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem("auth");
    if (!stored) return null;

    try {
      const auth: AuthState = JSON.parse(stored);

      // Check if token is expired
      if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) {
        this.clearAuth();
        return null;
      }

      return auth;
    } catch {
      return null;
    }
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    const auth = this.getAuth();
    return auth?.token || null;
  }

  /**
   * Get current company ID
   */
  getCurrentCompanyId(): string | null {
    const auth = this.getAuth();
    return auth?.currentCompanyId || null;
  }

  /**
   * Set current company ID
   */
  setCurrentCompanyId(companyId: string): void {
    const auth = this.getAuth();
    if (!auth) return;

    auth.currentCompanyId = companyId;
    localStorage.setItem("auth", JSON.stringify(auth));
  }

  /**
   * Clear auth data (logout)
   */
  clearAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth");

    // Also clear the auth cookie
    if (typeof document !== "undefined") {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuth() !== null;
  }

  /**
   * Get user's role for the current company
   */
  getCurrentRole(): UserRole | null {
    const auth = this.getAuth();
    if (!auth || !auth.currentCompanyId) return null;

    const company = auth.companies.find(
      (c) => c.companyId === auth.currentCompanyId
    );
    return company?.role || null;
  }

  /**
   * Check if user is a super admin
   */
  isSuperAdmin(): boolean {
    const role = this.getCurrentRole();
    return role === "super_admin";
  }

  /**
   * Check if user is an admin (company-level)
   */
  isAdmin(): boolean {
    const role = this.getCurrentRole();
    return role === "admin" || role === "super_admin";
  }

  /**
   * Check if user has a management role (can manage departments/projects)
   */
  hasManagementRole(): boolean {
    const role = this.getCurrentRole();
    return role === "super_admin" || role === "admin" || role === "dept_manager" || role === "project_lead";
  }

  /**
   * Check if user has permission for an action
   * Note: This is a basic permission check. Context-aware permissions
   * (e.g., dept_manager can only manage assigned departments) should be
   * handled at the API level or with additional context checks.
   */
  hasPermission(
    action: "create" | "update" | "delete",
    entity: string
  ): boolean {
    const role = this.getCurrentRole();
    if (!role) return false;

    // Super admin has all permissions (including creating companies)
    if (role === "super_admin") return true;

    // Admin has all permissions except creating companies
    if (role === "admin") {
      if (action === "create" && entity === "company") return false;
      return true;
    }

    // Department Manager permissions
    if (role === "dept_manager") {
      // Can manage tasks, documents in their departments
      if (entity === "task" || entity === "document") {
        return action === "create" || action === "update" || action === "delete";
      }
      // Can view but not modify departments/projects at company level
      return false;
    }

    // Project Lead permissions
    if (role === "project_lead") {
      // Can manage tasks in their projects
      if (entity === "task") {
        return action === "create" || action === "update" || action === "delete";
      }
      // Can manage documents
      if (entity === "document") {
        return action === "create" || action === "update";
      }
      return false;
    }

    // Employee permissions - very limited
    if (role === "employee") {
      // Employees can only update task status (not create/delete tasks)
      // This is handled at API level - they use PATCH /tasks/{id}/status
      if (entity === "task" && action === "update") {
        return true; // Only for status updates on assigned tasks
      }
      // Employees cannot create or delete anything
      return false;
    }

    return false;
  }

  /**
   * Check if user can create tasks
   * Employees cannot create tasks, only update status on assigned tasks
   */
  canCreateTasks(): boolean {
    const role = this.getCurrentRole();
    return role === "super_admin" || role === "admin" || role === "dept_manager" || role === "project_lead";
  }

  /**
   * Check if user can delete tasks
   */
  canDeleteTasks(): boolean {
    const role = this.getCurrentRole();
    return role === "super_admin" || role === "admin" || role === "dept_manager" || role === "project_lead";
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorData: ApiError = {
      message: "An error occurred",
      status: response.status,
    };

    try {
      const data = await response.json();

      if (typeof data === "string") {
        errorData.message = data;
      } else if (data.message) {
        errorData.message = data.message;
        errorData.errors = data.errors;
      } else if (data.title) {
        // Handle ASP.NET Core ValidationProblem format
        errorData.message = data.title;
        errorData.errors = data.errors;
      }
    } catch {
      // If JSON parsing fails, use status text
      errorData.message = response.statusText || "An error occurred";
    }

    return errorData;
  }

  /**
   * Create authorized fetch headers
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const companyId = this.getCurrentCompanyId();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (companyId) {
      headers["X-Company-Id"] = companyId;
    }

    return headers;
  }
}

// Export singleton instance
export const authService = new AuthService();
