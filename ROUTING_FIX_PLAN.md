# Routing Fix Plan - Convert to Proper Next.js Navigation

**Priority:** HIGH - Should be done BEFORE main refactoring
**Estimated Time:** 2-3 hours
**Status:** Not Started

---

## 🔴 Current Problem

All pages render at `localhost:3000` with state-based conditional rendering:

```typescript
// app/page.tsx (WRONG APPROACH)
const [activeSection, setActiveSection] = useState("dashboard")

// Sidebar navigation
<button onClick={() => setActiveSection("companies")}>Companies</button>

// Conditional rendering
{activeSection === "companies" && <CompaniesPage />}
{activeSection === "projects" && <ProjectsPage />}
```

**Issues:**
- URLs never change (always `localhost:3000`)
- Can't bookmark specific pages
- Browser back/forward doesn't work
- No deep linking
- Not using Next.js routing at all

---

## ✅ Target Solution

Proper Next.js App Router navigation:

```typescript
// Sidebar navigation (CORRECT APPROACH)
<Link href="/companies">Companies</Link>
<Link href="/projects">Projects</Link>

// URLs:
localhost:3000/          → Dashboard
localhost:3000/companies → Companies page
localhost:3000/projects  → Projects page
```

---

## 📋 Implementation Steps

### Step 1: Create Shared Layout Component

**File:** `components/layout/AppLayout.tsx`

Create a layout component with:
- Sidebar navigation
- Header with search and profile
- Main content area
- Todos panel

This will wrap all pages.

### Step 2: Update Root Layout

**File:** `app/layout.tsx`

Add the AppLayout to wrap all pages (or keep layout separate per page).

### Step 3: Simplify Dashboard Page

**File:** `app/page.tsx`

Current: 800+ lines with all pages conditionally rendered
Target: Only dashboard content

```typescript
// app/page.tsx (SIMPLIFIED)
export default function DashboardPage() {
  return (
    <AppLayout>
      {/* Dashboard content only */}
    </AppLayout>
  )
}
```

### Step 4: Update Each Route Page

Each page file already exists but imports are wrong.

**Current structure:**
```
app/
├── companies/page.tsx    ✅ Exists but not used
├── projects/page.tsx     ✅ Exists but not used
├── document-control/page.tsx ✅ Exists but not used
```

**Make each page standalone:**

```typescript
// app/companies/page.tsx
import { AppLayout } from '@/components/layout/AppLayout'

export default function CompaniesPage() {
  return (
    <AppLayout>
      {/* Companies content */}
    </AppLayout>
  )
}
```

### Step 5: Update Sidebar Navigation

**File:** `components/layout/Sidebar.tsx` (to be created)

Change from:
```typescript
onClick={() => setActiveSection("companies")}
```

To:
```typescript
import Link from 'next/link'

<Link href="/companies">
  <Building2 />
  Companies
</Link>
```

Or use `useRouter`:
```typescript
import { useRouter } from 'next/navigation'

const router = useRouter()
<button onClick={() => router.push('/companies')}>
```

### Step 6: Update Active State

Change from state-based to URL-based:

```typescript
// OLD
const [activeSection, setActiveSection] = useState("dashboard")

// NEW
import { usePathname } from 'next/navigation'
const pathname = usePathname() // "/companies", "/projects", etc.
```

---

## 🗂️ File Changes Required

### New Files to Create:
1. `components/layout/AppLayout.tsx` - Main layout wrapper
2. `components/layout/Sidebar.tsx` - Sidebar navigation
3. `components/layout/Header.tsx` - Top header
4. `components/layout/TodosPanel.tsx` - Right panel

### Files to Modify:
1. `app/page.tsx` - Remove all conditional rendering, only show dashboard
2. `app/companies/page.tsx` - Wrap with AppLayout
3. `app/projects/page.tsx` - Wrap with AppLayout
4. `app/departments/page.tsx` - Wrap with AppLayout
5. `app/properties/page.tsx` - Wrap with AppLayout
6. `app/document-control/page.tsx` - Wrap with AppLayout
7. `app/users/page.tsx` - Wrap with AppLayout
8. `app/workflows/page.tsx` - Wrap with AppLayout
9. `app/virtual-chatbots/page.tsx` - Wrap with AppLayout
10. `app/secure-datacenter/page.tsx` - Wrap with AppLayout
11. `app/bms-hardware/page.tsx` - Wrap with AppLayout
12. `app/z-ai/page.tsx` - Wrap with AppLayout
13. `app/settings/page.tsx` - Wrap with AppLayout

---

## 📝 Detailed Implementation

### 1. Extract Sidebar (Priority #1)

**Current location:** `app/page.tsx` (lines ~420-520)

**Target:** `components/layout/Sidebar.tsx`

```typescript
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, FolderOpen, Users, /* ... */ } from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType
  path: string
  requiresAuth?: boolean
  adminOnly?: boolean
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'companies', label: 'Companies', icon: Building2, path: '/companies' },
  { id: 'departments', label: 'Departments', icon: Users, path: '/departments' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
  { id: 'properties', label: 'Properties', icon: Home, path: '/properties' },
  { id: 'document-control', label: 'Document Control', icon: FileText, path: '/document-control' },
  { id: 'users', label: 'Users', icon: Users, path: '/users', adminOnly: true },
  { id: 'workflows', label: 'Workflows', icon: Workflow, path: '/workflows' },
  { id: 'virtual-chatbots', label: 'Virtual Chatbots', icon: MessageSquare, path: '/virtual-chatbots' },
  { id: 'secure-datacenter', label: 'Secure Data Center', icon: Server, path: '/secure-datacenter' },
  { id: 'bms-hardware', label: 'BMS Hardware', icon: Smartphone, path: '/bms-hardware' },
  { id: 'z-ai', label: 'Z AI', icon: Bot, path: '/z-ai' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()

  return (
    <aside className={/* styling */}>
      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.path

        return (
          <Link
            key={item.id}
            href={item.path}
            className={`sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}
    </aside>
  )
}
```

### 2. Create App Layout

**File:** `components/layout/AppLayout.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TodosPanel } from './TodosPanel'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [todosPanelCollapsed, setTodosPanelCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleTodos={() => setTodosPanelCollapsed(!todosPanelCollapsed)} />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      <TodosPanel collapsed={todosPanelCollapsed} />
    </div>
  )
}
```

### 3. Update Dashboard Page

**File:** `app/page.tsx`

Remove all imports of other pages and conditional rendering:

```typescript
'use client'

import { AppLayout } from '@/components/layout/AppLayout'
// Import only dashboard-specific components

export default function DashboardPage() {
  // Only dashboard state and logic

  return (
    <AppLayout>
      {/* Dashboard content */}
      <div className="space-y-6">
        <h1>Global Dashboard</h1>
        {/* Metrics cards */}
        {/* Company overview */}
        {/* etc. */}
      </div>
    </AppLayout>
  )
}
```

### 4. Update Individual Pages

**Example:** `app/companies/page.tsx`

```typescript
'use client'

import { AppLayout } from '@/components/layout/AppLayout'
// Existing companies page code

export default function CompaniesPage() {
  // Existing companies logic

  return (
    <AppLayout>
      {/* Existing companies content */}
    </AppLayout>
  )
}
```

Repeat for all 12 pages.

---

## ✅ Testing Checklist

After implementation:

- [ ] Navigate to `/` shows dashboard
- [ ] Navigate to `/companies` shows companies page
- [ ] Navigate to `/projects` shows projects page
- [ ] Navigate to `/document-control` shows document control
- [ ] All sidebar links work
- [ ] Active sidebar item highlights correctly
- [ ] Browser back/forward buttons work
- [ ] Can bookmark specific pages
- [ ] Can refresh page without losing context
- [ ] Authentication still works on all routes
- [ ] Admin-only pages (like `/users`) are protected

---

## 🎯 Benefits After Fix

✅ Proper URLs for each page
✅ Bookmarkable pages
✅ Browser back/forward works
✅ Deep linking support
✅ Better SEO
✅ Standard Next.js patterns
✅ Cleaner code architecture
✅ Easier to maintain

---

## ⚠️ Important Notes

1. **Do this FIRST** before the main refactoring plan
2. Each page file already exists - we're just making them work properly
3. The layout extraction is actually part of the refactoring plan anyway
4. This will make the main refactoring easier

---

## 🚀 Ready to Implement?

This should take 2-3 hours to complete. Want me to:
1. Start implementing now?
2. Do it step-by-step with you?
3. Wait until you're ready?

**Recommendation:** Do this NOW. It's a prerequisite for the main refactoring plan and will make everything else easier.
