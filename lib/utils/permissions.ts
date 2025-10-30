// Permission utility functions
import { authService } from '@/lib/services/auth'

export type Role = 'admin' | 'member' | 'viewer'

export interface PermissionCheck {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canView: boolean
}

/**
 * Get current user's role
 */
export function getCurrentRole(): Role | null {
  const auth = authService.getAuth()
  if (!auth || !auth.currentCompanyId) return null

  const currentCompany = auth.companies.find(c => c.companyId === auth.currentCompanyId)
  return (currentCompany?.role as Role) || null
}

/**
 * Check if user has specific permission
 */
export function hasPermission(action: 'create' | 'edit' | 'delete' | 'view'): boolean {
  const role = getCurrentRole()
  if (!role) return false

  const permissions: Record<Role, PermissionCheck> = {
    admin: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canView: true,
    },
    member: {
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canView: true,
    },
    viewer: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canView: true,
    },
  }

  const rolePermissions = permissions[role]

  switch (action) {
    case 'create':
      return rolePermissions.canCreate
    case 'edit':
      return rolePermissions.canEdit
    case 'delete':
      return rolePermissions.canDelete
    case 'view':
      return rolePermissions.canView
    default:
      return false
  }
}

/**
 * Get all permissions for current role
 */
export function getPermissions(): PermissionCheck {
  const role = getCurrentRole()

  const permissions: Record<Role, PermissionCheck> = {
    admin: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canView: true,
    },
    member: {
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canView: true,
    },
    viewer: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canView: true,
    },
  }

  return role ? permissions[role] : {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: false,
  }
}

/**
 * Get role display information
 */
export function getRoleInfo(role: Role) {
  const roleInfo = {
    admin: {
      label: 'Administrator',
      description: 'Full access - Can create, edit, and delete all resources',
      color: 'red',
      icon: '👑',
      badge: 'ADMIN',
    },
    member: {
      label: 'Member',
      description: 'Can create and edit resources, but cannot delete',
      color: 'blue',
      icon: '✏️',
      badge: 'MEMBER',
    },
    viewer: {
      label: 'Viewer',
      description: 'Read-only access - Can view but not modify',
      color: 'gray',
      icon: '👁️',
      badge: 'VIEWER',
    },
  }

  return roleInfo[role]
}
