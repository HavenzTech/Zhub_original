# Frontend Authentication & Integration Guide

**Last Updated:** 2025-10-30
**Purpose:** Complete guide for authentication implementation in the Next.js frontend

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [File Structure](#file-structure)
3. [Authentication Flow](#authentication-flow)
4. [Permission System](#permission-system)
5. [Testing & Verification](#testing--verification)
6. [Common Patterns](#common-patterns)

---

## Authentication Overview

### What's Implemented

✅ **JWT Authentication** - Token-based auth with ASP.NET Core backend
✅ **Multi-tenant Support** - Company-based data isolation
✅ **Role-based Permissions** - Admin, Member, Viewer roles
✅ **Route Protection** - Automatic redirect for unauthenticated users
✅ **Token Management** - Auto-storage in localStorage with expiry checking
✅ **API Integration** - Automatic auth headers for all API calls

---

## File Structure

### Core Authentication Files

```
lib/
├── types/
│   └── auth.ts                    # TypeScript types for auth
├── services/
│   ├── auth.ts                    # Auth service (login, token management)
│   └── bmsApi.ts                  # API client with auto-auth headers
├── utils/
│   └── permissions.ts             # Permission utility functions
└── hooks/
    └── useAuth.ts                 # Auth hooks for components

components/
├── UserProfile.tsx                # User profile dropdown (shows role)
└── PermissionMatrixDemo.tsx      # Visual permission matrix display

app/
├── login/
│   └── page.tsx                   # Login page with form validation
├── layout.tsx                     # Root layout with toast notifications
└── page.tsx                       # Protected dashboard
```

---

## Authentication Flow

### 1. User Login

**File:** `app/login/page.tsx`

```typescript
import { authService } from "@/lib/services/auth"

const onSubmit = async (values: LoginFormValues) => {
  try {
    // Call backend login API
    const response = await authService.login(values)

    // Store JWT token + user data in localStorage
    authService.storeAuth(response)

    // Show success message
    toast.success("Login successful!")

    // Redirect to dashboard
    router.push("/")
  } catch (error) {
    toast.error("Login failed")
  }
}
```

**What happens:**
1. User enters email/password
2. Frontend validates with Zod schema
3. API call to `POST /api/auth/login`
4. Backend returns JWT + user info + companies
5. Data stored in localStorage
6. User redirected to dashboard

### 2. Route Protection

**File:** `app/page.tsx`

```typescript
useEffect(() => {
  const auth = authService.getAuth()

  if (!auth) {
    router.push('/login')  // Not authenticated
    return
  }

  // Set token & company ID for API calls
  const token = authService.getToken()
  const companyId = authService.getCurrentCompanyId()

  if (token) bmsApi.setToken(token)
  if (companyId) bmsApi.setCompanyId(companyId)

  setIsAuthenticated(true)
}, [router])
```

**What happens:**
1. Dashboard checks for auth on mount
2. If no auth → redirect to login
3. If authenticated → configure API client
4. Load dashboard data

### 3. API Calls with Auto-Auth

**File:** `lib/services/bmsApi.ts`

```typescript
private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Auto-attach auth headers
  if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`
  }

  if (this.companyId) {
    headers['X-Company-Id'] = this.companyId
  }

  // Make request...
}
```

**What happens:**
1. Any API call automatically includes auth headers
2. Backend validates JWT token
3. Backend enforces company isolation
4. Data returned only for user's company

---

## Permission System

### Role Hierarchy

| Role | Create | Edit | Delete | View |
|------|--------|------|--------|------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ✅ | ❌ | ✅ |
| **Viewer** | ❌ | ❌ | ❌ | ✅ |

### Using Permissions in Code

**File:** `lib/utils/permissions.ts`

```typescript
import { hasPermission, getCurrentRole } from '@/lib/utils/permissions'

// Check specific permission
if (hasPermission('delete')) {
  // Show delete button
}

// Get current role
const role = getCurrentRole() // 'admin' | 'member' | 'viewer'

// Get all permissions
const perms = getPermissions()
// { canView: true, canCreate: true, canEdit: true, canDelete: false }
```

### Example: Conditional UI

```tsx
import { hasPermission } from '@/lib/utils/permissions'

function ProjectCard({ project }) {
  return (
    <Card>
      <CardContent>
        {/* Everyone can view */}
        <h3>{project.name}</h3>

        {/* Only members and admins can edit */}
        {hasPermission('edit') && (
          <Button onClick={handleEdit}>Edit</Button>
        )}

        {/* Only admins can delete */}
        {hasPermission('delete') && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Testing & Verification

### Test User Accounts

**Backend must be running:** `http://localhost:5087`

#### Admin User (Full Access)
```
Email: sarah.johnson@agritech.com
Password: Password123!
Role: admin
Company: Agritech Haven LP
Company ID: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a
```

#### Member User (Can Edit, Cannot Delete)
```
Email: lisa.martinez@agritech.com
Password: Password123!
Role: member
Company: Agritech Haven LP
Company ID: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a
```

#### Viewer User (Read-Only)
```
Email: amanda.garcia@agritech.com
Password: Password123!
Role: viewer
Company: Agritech Haven LP
Company ID: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a
```

### Visual Permission Indicators

1. **User Profile Dropdown** (Top right)
   - Click your avatar
   - See current role badge (👑 ADMIN, ✏️ MEMBER, 👁️ VIEWER)
   - See "Full Access", "Can Edit", or "Read Only"

2. **Permission Matrix Dashboard**
   - Navigate to **Settings** → **My Permissions**
   - See visual grid of what you can/cannot do
   - Test interactive buttons

### Verification Steps

1. **Login Test:**
   ```
   ✓ Navigate to http://localhost:3000/login
   ✓ Enter test credentials
   ✓ Should see success toast
   ✓ Should redirect to dashboard
   ```

2. **Route Protection Test:**
   ```
   ✓ Logout
   ✓ Try to access http://localhost:3000
   ✓ Should auto-redirect to /login
   ```

3. **Permission Test:**
   ```
   ✓ Login as admin → all buttons enabled
   ✓ Login as member → delete buttons disabled
   ✓ Login as viewer → create/edit/delete disabled
   ```

---

## Common Patterns

### Pattern 1: Protected Page

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth"

export default function ProtectedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = authService.getAuth()
    if (!auth) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) return <div>Loading...</div>

  return <div>Protected Content</div>
}
```

### Pattern 2: API Call with Auth

```typescript
import { bmsApi } from "@/lib/services/bmsApi"

async function loadProjects() {
  try {
    // Auth headers automatically included
    const projects = await bmsApi.projects.getAll()
    setProjects(projects)
  } catch (error) {
    if (error.status === 401) {
      // Token expired, redirect to login
      router.push('/login')
    }
  }
}
```

### Pattern 3: Role-Based Component

```typescript
import { getCurrentRole } from "@/lib/utils/permissions"

function AdminPanel() {
  const role = getCurrentRole()

  if (role !== 'admin') {
    return <div>Access Denied</div>
  }

  return <div>Admin Panel</div>
}
```

### Pattern 4: Logout

```typescript
import { authService } from "@/lib/services/auth"
import { useRouter } from "next/navigation"

function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    authService.clearAuth()
    router.push('/login')
  }

  return <Button onClick={handleLogout}>Logout</Button>
}
```

---

## localStorage Structure

### Stored Auth Data

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "12345678-1234-1234-1234-123456789abc",
  "email": "sarah.johnson@agritech.com",
  "name": "Sarah Johnson",
  "companies": [
    {
      "companyId": "0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a",
      "companyName": "Agritech Haven LP",
      "role": "admin"
    }
  ],
  "currentCompanyId": "0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a",
  "expiresAt": "2025-10-30T14:00:00.000Z"
}
```

**Key:** `auth`
**Location:** Browser localStorage
**Expiry:** Checked on every `getAuth()` call

---

## Error Handling

### Common Error Scenarios

#### 401 Unauthorized (Invalid/Expired Token)
```typescript
if (error.status === 401) {
  authService.clearAuth()
  router.push('/login')
  toast.error('Session expired. Please login again.')
}
```

#### 403 Forbidden (Insufficient Permissions)
```typescript
if (error.status === 403) {
  toast.error('You do not have permission to perform this action.')
}
```

#### 400 Bad Request (Validation Error)
```typescript
if (error.status === 400 && error.errors) {
  Object.entries(error.errors).forEach(([field, messages]) => {
    form.setError(field, { message: messages.join(", ") })
  })
}
```

---

## Security Best Practices

✅ **DO:**
- Store JWT in localStorage (not cookies for this SPA)
- Check token expiry on every page load
- Clear auth data on logout
- Use HTTPS in production
- Validate on both frontend and backend

❌ **DON'T:**
- Store passwords in localStorage
- Trust client-side permissions alone
- Skip token expiry checks
- Hardcode API URLs in components

---

## Troubleshooting

### "Login successful but immediately logs out"
- Check if backend is running on `http://localhost:5087`
- Verify CORS is configured for `http://localhost:3000`
- Check browser console for API errors

### "Permission checks not working"
- Verify user role in Settings → My Permissions
- Check localStorage `auth` object for correct role
- Ensure `currentCompanyId` matches company in token

### "API calls return 401"
- Token may be expired
- Backend may not be running
- Check Network tab for `Authorization` header

---

## Next Steps

For developers extending this system:

1. **Add new protected routes:** Follow Pattern 1 above
2. **Add new API endpoints:** Extend `lib/services/bmsApi.ts`
3. **Add new roles:** Update `lib/utils/permissions.ts`
4. **Add new auth providers:** Extend `lib/services/auth.ts`

---

**Related Documentation:**
- [AUTHORIZATION.md](./AUTHORIZATION.md) - Backend auth details
- [BACKEND_API_INTEGRATION_GUIDE.md](../BACKEND_API_INTEGRATION_GUIDE.md) - Full API reference
- [DTO_PATTERN.md](./DTO_PATTERN.md) - Request/response models
