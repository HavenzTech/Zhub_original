# AI-Assisted Development Guide for HavenzBMS

This guide helps developers work with AI coding assistants (like Claude, GitHub Copilot, ChatGPT) on the HavenzBMS project.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Essential Documentation Files](#essential-documentation-files)
3. [Common Tasks & Prompts](#common-tasks--prompts)
4. [Architecture Overview](#architecture-overview)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Best Practices](#best-practices)

---

## Quick Start

### Project Structure

```
HavenzBMS/
├── Zhub_original/              # Next.js Frontend
│   ├── app/                    # Pages (companies, departments, etc.)
│   ├── lib/services/           # API clients (bmsApi.ts, auth.ts)
│   ├── components/             # Reusable UI components
│   └── docs/                   # Frontend documentation
│
├── WebApp/                     # ASP.NET Core Backend
│   ├── Controllers/HavenzHub/  # API endpoints
│   ├── Models/HavenzHub/       # DTOs (CreateXRequest, UpdateXRequest)
│   └── docs/                   # Backend documentation
│
└── DomainModel/HavenzHub/      # Database entities
```

### Start Backend
```bash
cd C:\repositories\HavenzBMS\WebApp
dotnet run
# Backend runs on http://localhost:5087
```

### Start Frontend
```bash
cd C:\repositories\HavenzBMS\Zhub_original
npm run dev
# Frontend runs on http://localhost:3000
```

---

## Essential Documentation Files

When prompting an AI assistant, reference these files:

### Frontend Documentation
| File | Purpose | When to Reference |
|------|---------|------------------|
| `docs/FRONTEND_API_REFERENCE.md` | API endpoints, request/response formats | Any API integration work |
| `docs/BACKEND_API_INTEGRATION_GUIDE.md` | How to use bmsApi service | Creating API calls |
| `docs/PERMISSION_MATRIX.md` | Role-based permissions | Adding permission checks |
| `Zhub_original/docs/AI_DEVELOPMENT_GUIDE.md` | This file | Getting started |

### Backend Documentation
| File | Purpose | When to Reference |
|------|---------|------------------|
| `WebApp/docs/development/DTO_PATTERN.md` | Request/Response DTOs | Creating/updating endpoints |
| `WebApp/docs/development/AUTHORIZATION.md` | Role-based access control | Adding permissions |
| `WebApp/docs/architecture/PERMISSION_MATRIX.md` | Permission rules | Understanding access control |

---

## Common Tasks & Prompts

### Task 1: Add CREATE Functionality to a Page

**Example Prompt:**
```
I need to add a "Create Department" button and modal to the Departments page.

Reference files:
- docs/FRONTEND_API_REFERENCE.md (Department CREATE endpoint)
- Zhub_original/app/companies/page.tsx (working example of create modal)
- docs/PERMISSION_MATRIX.md (who can create departments)

Requirements:
1. Add "+ Add Department" button with permission check (admin only)
2. Create a modal form with fields from the API reference
3. Use bmsApi.departments.create() to submit
4. Handle success/error with toast notifications
5. Refresh the list after successful creation
```

**Key Points:**
- Always reference working examples (companies, projects already work)
- Include permission checks based on PERMISSION_MATRIX.md
- Use existing UI components (Dialog, Button, Input from shadcn/ui)

---

### Task 2: Add EDIT Functionality

**Example Prompt:**
```
Add edit functionality for the Department entity.

Reference:
- Zhub_original/app/companies/page.tsx (lines 173-246) - working edit implementation
- docs/FRONTEND_API_REFERENCE.md (Department UPDATE endpoint)

Requirements:
1. Add "Edit Department" button in detail view (admin only)
2. Create edit modal that pre-fills current values
3. Use bmsApi.departments.update(id, payload)
4. Update local state after success
5. Follow same pattern as Company edit
```

**Key Points:**
- Copy patterns from working implementations
- Pre-populate form with current entity data
- Update both list and detail views after edit

---

### Task 3: Fix API Integration Errors

**Example Prompt:**
```
I'm getting "400 Bad Request" when creating a department.

Error details:
{
  "errors": {
    "Company": ["The Company field is required."]
  }
}

Reference files to check:
- WebApp/docs/development/DTO_PATTERN.md
- WebApp/Controllers/HavenzHub/DepartmentController.cs
- WebApp/Models/HavenzHub/ (check if CreateDepartmentRequest.cs exists)

Question: Does the backend use DTOs? If not, provide the implementation.
```

**Key Points:**
- Share the exact error message
- Reference DTO_PATTERN.md for backend architecture
- Check if DTOs exist for the entity

---

### Task 4: Add Permission-Based UI

**Example Prompt:**
```
Hide/show buttons based on user role according to PERMISSION_MATRIX.md

Reference:
- docs/PERMISSION_MATRIX.md (permission rules)
- Zhub_original/lib/services/auth.ts (hasPermission function)
- Zhub_original/app/companies/page.tsx (example of permission checks)

Requirements:
1. Only admins see "Add Department" button
2. Only admins see "Edit Department" button
3. Viewers see no action buttons
4. Use authService.hasPermission('create', 'department') pattern
```

**Key Points:**
- Always reference PERMISSION_MATRIX.md
- Use existing authService.hasPermission() helper
- Hide buttons with conditional rendering, not disable them

---

### Task 5: Initialize Authentication on Page

**Example Prompt:**
```
Add authentication initialization to a new page.

Reference:
- Zhub_original/app/departments/page.tsx (lines 59-74) - working auth initialization

Requirements:
1. Check if user is authenticated on mount
2. Redirect to /login if not authenticated
3. Set JWT token on bmsApi using bmsApi.setToken()
4. Set company ID using bmsApi.setCompanyId()
5. Then load page data
```

**Key Points:**
- Every page needs auth initialization
- Use authService.getAuth() to check authentication
- Always set both token AND companyId on bmsApi

---

## Architecture Overview

### Frontend Architecture

```typescript
// Authentication Flow
authService.login()
  → Store JWT token + user info in localStorage
  → bmsApi.setToken(token)
  → bmsApi.setCompanyId(companyId)
  → Navigate to dashboard

// API Call Flow
User Action (e.g., "Create Department")
  → Form Validation
  → Build payload (no companyId - set by backend from header)
  → bmsApi.departments.create(payload)
  → Backend validates & creates
  → Update local state
  → Show success toast
```

### Backend Architecture

```
Request → Controller (+ DTO) → Repository → Database
                ↓
         - Validate DTO fields
         - Set CompanyId from X-Company-Id header
         - Set UserId from JWT token
         - Enforce role permissions
```

**Key Principle**:
- ✅ Frontend sends only business data (name, description, etc.)
- ✅ Backend sets system fields (id, companyId, userId, timestamps)
- ✅ DTOs prevent navigation property validation errors

---

## Troubleshooting Common Issues

### Issue 1: "400 Bad Request - Company field is required"

**Cause**: Backend controller accepting domain entity instead of DTO

**Solution**: Check if DTO exists and controller uses it

**AI Prompt:**
```
Check if CreateDepartmentRequest DTO exists in WebApp/Models/HavenzHub/
If not, create it following the pattern in CreateProjectRequest.cs
Update DepartmentController.cs to use the DTO
Reference: WebApp/docs/development/DTO_PATTERN.md
```

---

### Issue 2: "401 Unauthorized" on API calls

**Cause**: Missing or invalid JWT token

**Solution**: Ensure auth initialization on page mount

**Check:**
1. Is `authService.getAuth()` returning data?
2. Is `bmsApi.setToken()` being called?
3. Is token expired? (check `expiresAt` field)

**AI Prompt:**
```
Add auth initialization to [page-name] following the pattern in
Zhub_original/app/departments/page.tsx lines 59-74
```

---

### Issue 3: "403 Forbidden" on API calls

**Cause**: User doesn't have required role permission

**Check**: PERMISSION_MATRIX.md for required role

**Example:**
- Creating departments: Requires `admin` role
- Creating projects: Requires `admin` OR `member` role
- Viewing data: All roles can view

---

### Issue 4: API call works but button is visible to wrong role

**Cause**: Missing permission check on UI element

**Solution**: Add authService.hasPermission() check

**AI Prompt:**
```
Add permission checks to [entity] page following PERMISSION_MATRIX.md
Reference implementation: Zhub_original/app/companies/page.tsx
Use authService.hasPermission('action', 'entity') pattern
```

---

### Issue 5: "X-Company-Id header missing" error

**Cause**: bmsApi.setCompanyId() not called

**Solution**: Set companyId in auth initialization

```typescript
const companyId = authService.getCurrentCompanyId()
if (companyId) bmsApi.setCompanyId(companyId)
```

---

## Best Practices

### 1. Always Reference Working Examples

**DO:**
```
"Add edit functionality following the pattern in
app/companies/page.tsx lines 173-246"
```

**DON'T:**
```
"Add edit functionality" (too vague, AI might guess wrong pattern)
```

---

### 2. Specify File Locations

**DO:**
```
"Check WebApp/Models/HavenzHub/CreateDepartmentRequest.cs"
```

**DON'T:**
```
"Check if there's a DTO" (AI might search wrong location)
```

---

### 3. Include Context in Prompts

**DO:**
```
"I'm getting error X when doing Y.
Current code: [paste relevant code]
Reference: [file path:line numbers]"
```

**DON'T:**
```
"Fix the error" (no context)
```

---

### 4. Reference Documentation Files

**DO:**
```
"According to PERMISSION_MATRIX.md, only admins can create departments.
Add authService.hasPermission('create', 'department') check"
```

**DON'T:**
```
"Add permission check" (AI might implement wrong logic)
```

---

### 5. Request Incremental Changes

**DO:**
```
"First, add the create button.
Then, create the modal form.
Then, add the API call.
Then, add error handling."
```

**DON'T:**
```
"Implement full CRUD for departments" (too much at once)
```

---

## Example: Complete Feature Implementation

### Prompt Template for Adding Full CRUD

```markdown
I need to implement full CRUD for [Entity Name].

## Context
- Frontend: Zhub_original/app/[entity-name]/page.tsx
- Backend Controller: WebApp/Controllers/HavenzHub/[Entity]Controller.cs
- Backend DTO: WebApp/Models/HavenzHub/Create[Entity]Request.cs

## Step 1: Verify Backend
Check if these files exist:
1. WebApp/Models/HavenzHub/Create[Entity]Request.cs
2. WebApp/Models/HavenzHub/Update[Entity]Request.cs
3. WebApp/Controllers/HavenzHub/[Entity]Controller.cs uses DTOs

If DTOs are missing, create them following:
- Reference: WebApp/docs/development/DTO_PATTERN.md
- Example: WebApp/Models/HavenzHub/CreateProjectRequest.cs

## Step 2: Frontend CREATE
Add "+ Add [Entity]" button and modal to the list page.
- Reference: Zhub_original/app/companies/page.tsx (create modal)
- Permission: Check PERMISSION_MATRIX.md for required role
- API: Use bmsApi.[entities].create(payload)

## Step 3: Frontend EDIT
Add "Edit [Entity]" button in detail view.
- Reference: Zhub_original/app/companies/page.tsx (lines 173-246)
- Permission: Check PERMISSION_MATRIX.md
- API: Use bmsApi.[entities].update(id, payload)

## Step 4: Frontend DELETE (optional)
Add delete confirmation and API call.
- Permission: Usually admin only
- API: Use bmsApi.[entities].delete(id)

## Step 5: Test
1. Login as admin
2. Create new [entity]
3. Edit the [entity]
4. Delete the [entity]
5. Login as member/viewer - verify buttons are hidden
```

---

## Quick Reference: API Patterns

### CREATE Pattern
```typescript
const payload: any = {
  name: formData.name, // Required field
  // Optional fields - only if they have values
}
if (formData.description?.trim()) payload.description = formData.description
if (formData.budget && !isNaN(parseFloat(formData.budget))) {
  payload.budget = parseFloat(formData.budget)
}

const newEntity = await bmsApi.entities.create(payload)
setEntities(prev => [...prev, newEntity])
toast.success("Created successfully!")
```

### UPDATE Pattern
```typescript
const payload: any = {
  id: entity.id, // Required for PUT
  name: formData.name,
  // ... other fields
}

await bmsApi.entities.update(entity.id, payload)
setEntities(prev => prev.map(e => e.id === entity.id ? {...e, ...payload} : e))
toast.success("Updated successfully!")
```

### Permission Check Pattern
```typescript
{authService.hasPermission('create', 'department') && (
  <Button onClick={() => setShowCreateModal(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Add Department
  </Button>
)}
```

### Auth Initialization Pattern
```typescript
useEffect(() => {
  const auth = authService.getAuth()
  if (!auth) {
    router.push('/login')
    return
  }

  const token = authService.getToken()
  const companyId = authService.getCurrentCompanyId()

  if (token) bmsApi.setToken(token)
  if (companyId) bmsApi.setCompanyId(companyId)

  loadData()
}, [router])
```

---

## Tips for Working with AI Assistants

### 1. Start with "Read First" Prompts
```
"Read the following files to understand the current implementation:
- Zhub_original/app/companies/page.tsx
- docs/FRONTEND_API_REFERENCE.md (Department section)
Then suggest how to implement department create functionality"
```

### 2. Ask for Explanations
```
"Explain why we need DTOs in the backend and how they prevent
the 'Company field is required' error"
```

### 3. Request Specific Changes Only
```
"Add only the create button and permission check.
Don't implement the modal yet."
```

### 4. Verify Before Implementing
```
"Before implementing, check:
1. Does the backend endpoint exist?
2. Does it use DTOs?
3. What role permissions are required?
Then provide the implementation."
```

### 5. Use Working Examples
```
"Copy the exact pattern from companies/page.tsx for the edit modal.
Change only the entity-specific parts."
```

---

## Common Mistakes to Avoid

### ❌ Don't Send CompanyId in Request Body
```typescript
// WRONG
const payload = {
  companyId: someId,  // ❌ Don't send this
  name: "Department"
}
```

```typescript
// CORRECT
const payload = {
  name: "Department"  // ✅ Backend sets companyId from header
}
```

### ❌ Don't Disable Buttons, Hide Them
```typescript
// WRONG
<Button disabled={!isAdmin}>Edit</Button>  // ❌ Shows disabled button

// CORRECT
{isAdmin && <Button>Edit</Button>}  // ✅ Hides button completely
```

### ❌ Don't Forget Auth Initialization
```typescript
// WRONG
useEffect(() => {
  loadData()  // ❌ Might not be authenticated
}, [])

// CORRECT
useEffect(() => {
  const auth = authService.getAuth()
  if (!auth) return router.push('/login')

  bmsApi.setToken(authService.getToken())
  bmsApi.setCompanyId(authService.getCurrentCompanyId())

  loadData()  // ✅ Auth is set
}, [])
```

---

## Resources

### Frontend Files to Reference
- **Working CRUD**: `app/companies/page.tsx`
- **API Service**: `lib/services/bmsApi.ts`
- **Auth Service**: `lib/services/auth.ts`
- **Type Definitions**: `types/bms.ts`

### Backend Files to Reference
- **DTO Example**: `WebApp/Models/HavenzHub/CreateProjectRequest.cs`
- **Controller Example**: `WebApp/Controllers/HavenzHub/ProjectController.cs`
- **DTO Pattern Doc**: `WebApp/docs/development/DTO_PATTERN.md`

### Testing Endpoints
```bash
# Health check
curl http://localhost:5087/health

# Test authenticated endpoint
curl http://localhost:5087/api/havenzhub/department \
  -H "Authorization: Bearer {token}" \
  -H "X-Company-Id: {companyId}"
```

---

## Getting Help

When asking AI for help, provide:
1. **What you're trying to do**: "Add create functionality for departments"
2. **What's not working**: Error messages, unexpected behavior
3. **What you've tried**: Code snippets
4. **Relevant files**: File paths and line numbers
5. **Documentation**: Reference the relevant .md files

**Example Good Prompt:**
```
I'm trying to add department create functionality.

Current issue: Getting 400 error when submitting form
Error: "Company field is required"

Code: app/departments/page.tsx lines 100-120 [paste code]

Questions:
1. Check if WebApp/Models/HavenzHub/CreateDepartmentRequest.cs exists
2. Check if DepartmentController uses DTO pattern (see DTO_PATTERN.md)
3. If DTOs are missing, provide implementation following CreateProjectRequest.cs
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-10-31 | Initial guide creation | Development Team |

---

**Happy Coding with AI! 🤖✨**
