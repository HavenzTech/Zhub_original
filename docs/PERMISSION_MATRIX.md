# Havenz Hub - Permission Matrix (RBAC)

> **Comprehensive Role-Based Access Control Matrix for Multi-Tenant System**

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Permission Matrix by Entity](#permission-matrix-by-entity)
4. [Special Operations](#special-operations)
5. [Multi-Tenancy Rules](#multi-tenancy-rules)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Security Considerations](#security-considerations)

---

## 🎯 Overview

### System Architecture
- **Multi-tenant system** with company-level data isolation
- **3 user roles** per company: Admin, Member, Viewer
- **Role scope**: Per-company (user can have different roles in different companies)
- **10 core entities**: Users, Companies, Departments, Projects, Properties, Documents, BMS Devices, Facial Recognition, Access Logs, IoT Metrics

### Current Implementation Status
⚠️ **Authorization NOT yet implemented** - Controllers currently have no `[Authorize]` attributes
✅ **Database schema ready** - Role field exists in `user_companies` table
✅ **Roles defined** - UserCompanyRole enum: Admin, Member, Viewer

---

## 👥 Role Definitions

### 1. **Admin**
**Full control over company data**
- Can perform ALL operations on company resources
- Can manage users (add/remove from company, assign roles)
- Can approve/reject documents
- Can perform hard deletes (with caution)
- Can configure BMS devices and access control
- **Example**: Company owner, IT administrator, Operations manager

### 2. **Member**
**Regular operational access**
- Can create, read, and update most entities
- Can upload and modify documents (own uploads)
- Can view and create access logs
- Can view BMS devices and metrics
- **Cannot**: Approve documents, delete entities, manage users, configure BMS devices
- **Example**: Department staff, project managers, facility operators

### 3. **Viewer**
**Read-only access**
- Can only view/read data
- Can only see **approved** documents
- Can view public information
- **Cannot**: Create, update, or delete anything
- **Example**: External consultants, auditors, contractors

---

## 📊 Permission Matrix by Entity

### Legend
- ✅ = Allowed
- ❌ = Denied
- 🔸 = Conditional (see notes)
- 🔒 = Company isolation enforced

---

### 1. **USERS** (identity.users)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /user/{id}** | ✅ | 🔸 | 🔸 | Members/Viewers: only users in same company |
| **GET /user** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /user/email/{email}** | ✅ | ✅ | ✅ | 🔒 Only if user in same company |
| **GET /user/company/{companyId}** | ✅ | ✅ | ✅ | 🔒 Only current company |
| **POST /user** | ✅ | ❌ | ❌ | Admin only |
| **PUT /user/{id}** | ✅ | 🔸 | ❌ | Members: own profile only |
| **DELETE /user/{id}** | ✅ | ❌ | ❌ | Admin only, removes from system |

**Multi-tenancy**: Users can belong to multiple companies. Deletion removes user entirely, not just from one company.

---

### 2. **COMPANIES** (identity.companies)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /company/{id}** | ✅ | ✅ | ✅ | 🔒 Only companies user belongs to |
| **GET /company** | ✅ | ✅ | ✅ | 🔒 Only user's companies |
| **GET /company/status/{status}** | ✅ | ✅ | ✅ | 🔒 Filtered by user's companies |
| **GET /company/user/{userId}** | ✅ | ✅ | ✅ | 🔒 Only own user ID |
| **POST /company** | ❌ | ❌ | ❌ | System admin only (not in scope) |
| **PUT /company/{id}** | ✅ | ❌ | ❌ | Admin only |
| **DELETE /company/{id}** | ❌ | ❌ | ❌ | System admin only (not in scope) |

**Note**: Company creation/deletion typically handled by system administrators, not regular users.

---

### 3. **USER_COMPANIES** (identity.user_companies)
*Junction table controlling user-company membership and roles*

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /usercompany/{userId}** | ✅ | 🔸 | 🔸 | Members/Viewers: own user ID only |
| **POST /usercompany** | ✅ | ❌ | ❌ | Admin: Add users to company |
| **PUT /usercompany/{id}** | ✅ | ❌ | ❌ | Admin: Change user role |
| **DELETE /usercompany/{id}** | ✅ | ❌ | ❌ | Admin: Remove user from company |

**Critical**: This table controls who can access which companies and with what role. Only admins should modify.

---

### 4. **DEPARTMENTS** (business.departments)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /department/{id}** | ✅ | ✅ | ✅ | 🔒 Only departments in user's company |
| **GET /department** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /department/company/{companyId}** | ✅ | ✅ | ✅ | 🔒 Only current company |
| **GET /department/search/{name}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **POST /department** | ✅ | ❌ | ❌ | Admin only |
| **PUT /department/{id}** | ✅ | ❌ | ❌ | Admin only |
| **DELETE /department/{id}** | ✅ | ❌ | ❌ | Admin only, cascades to related records |

**Cascade Delete Impact**: Deleting department removes all junction table entries (project_departments, property_departments, document_departments).

---

### 5. **PROJECTS** (business.projects)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /project/{id}** | ✅ | ✅ | ✅ | 🔒 Only projects in user's company |
| **GET /project** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /project/company/{companyId}** | ✅ | ✅ | ✅ | 🔒 Only current company |
| **GET /project/status/{status}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /project/priority/{priority}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **POST /project** | ✅ | ✅ | ❌ | Admins and Members can create |
| **PUT /project/{id}** | ✅ | ✅ | ❌ | Admins and Members can update |
| **DELETE /project/{id}** | ✅ | ❌ | ❌ | Admin only |

**Business Logic**: Members can manage projects but not delete them. Viewer role is for external stakeholders.

---

### 6. **PROPERTIES** (business.properties)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /property/{id}** | ✅ | ✅ | ✅ | 🔒 Only properties in user's company |
| **GET /property** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /property/company/{companyId}** | ✅ | ✅ | ✅ | 🔒 Only current company |
| **GET /property/type/{type}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /property/status/{status}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **POST /property** | ✅ | ❌ | ❌ | Admin only (high-value asset) |
| **PUT /property/{id}** | ✅ | ✅ | ❌ | Members: update operational data only |
| **DELETE /property/{id}** | ✅ | ❌ | ❌ | Admin only |

**High-Value Asset**: Properties represent physical real estate/facilities. Strict controls recommended.

---

### 7. **DOCUMENTS** (documents.documents)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /document/{id}** | ✅ | ✅ | 🔸 | 🔒 Viewers: approved docs only |
| **GET /document** | ✅ | ✅ | 🔸 | 🔒 Viewers: approved docs only |
| **GET /document/company/{companyId}** | ✅ | ✅ | 🔸 | 🔒 Viewers: approved docs only |
| **GET /document/status/{status}** | ✅ | ✅ | 🔸 | Viewers: status=approved only |
| **GET /document/uploader/{userId}** | ✅ | ✅ | ❌ | Can see own uploads |
| **GET /document/category/{category}** | ✅ | ✅ | 🔸 | 🔒 Viewers: approved only |
| **GET /document/accesslevel/{level}** | ✅ | ✅ | 🔸 | Viewers: public/approved only |
| **GET /document/search/{name}** | ✅ | ✅ | 🔸 | 🔒 Viewers: approved only |
| **POST /document** | ✅ | ✅ | ❌ | Admins and Members can upload |
| **PUT /document/{id}** | ✅ | 🔸 | ❌ | Members: own uploads only |
| **DELETE /document/{id}** (soft) | ✅ | 🔸 | ❌ | Members: own uploads only |
| **DELETE /document/{id}/hard** | ✅ | ❌ | ❌ | Admin only |
| **POST /document/{id}/approve** | ✅ | ❌ | ❌ | Admin only (workflow) |
| **POST /document/{id}/reject** | ✅ | ❌ | ❌ | Admin only (workflow) |

**Document Workflow**:
1. Member uploads document (status: draft)
2. Member submits for approval (status: pending)
3. Admin approves/rejects (status: approved/rejected)
4. Viewers can only see approved documents

**Audit Trail**: All actions logged in `document_audit_trail` table.

---

### 8. **BMS DEVICES** (iot.bms_devices)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /bmsdevice/{id}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /bmsdevice** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /bmsdevice/property/{propertyId}** | ✅ | ✅ | ✅ | 🔒 Only user's company properties |
| **GET /bmsdevice/type/{type}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /bmsdevice/status/{status}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /bmsdevice/company/{companyId}** | ✅ | ✅ | ✅ | 🔒 Only current company |
| **GET /bmsdevice/maintenance/required** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **POST /bmsdevice** | ✅ | ❌ | ❌ | Admin only (physical hardware) |
| **PUT /bmsdevice/{id}** | ✅ | ✅ | ❌ | Members: operational updates only |
| **DELETE /bmsdevice/{id}** (soft) | ✅ | ❌ | ❌ | Admin only |

**Physical Asset**: BMS devices are hardware (cameras, sensors, tablets). Configuration requires admin rights.

---

### 9. **FACIAL RECOGNITION** (iot.facial_recognition)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /facialrecognition/{id}** | ✅ | 🔸 | ❌ | Members: own record only |
| **GET /facialrecognition/user/{userId}** | ✅ | 🔸 | ❌ | Members: own user ID only |
| **GET /facialrecognition/company/{companyId}** | ✅ | ❌ | ❌ | Admin only (privacy) |
| **POST /facialrecognition** | ✅ | 🔸 | ❌ | Members: enroll themselves |
| **PUT /facialrecognition/{id}** | ✅ | 🔸 | ❌ | Members: own record only |
| **DELETE /facialrecognition/{id}** | ✅ | 🔸 | ❌ | Members: own record only |

**Privacy Critical**: Biometric data subject to GDPR/privacy laws. Users should control their own facial data.

**GDPR Compliance**:
- Users must consent to facial recognition enrollment
- Users can delete their own facial data
- Admins can view for security/audit purposes
- Data encrypted at rest

---

### 10. **ACCESS LOGS** (iot.access_logs)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /accesslog/{id}** | ✅ | 🔸 | ❌ | Members: own logs only |
| **GET /accesslog** | ✅ | ❌ | ❌ | Admin only (security/audit) |
| **GET /accesslog/user/{userId}** | ✅ | 🔸 | ❌ | Members: own user ID only |
| **GET /accesslog/property/{propertyId}** | ✅ | ❌ | ❌ | Admin only |
| **GET /accesslog/device/{deviceId}** | ✅ | ❌ | ❌ | Admin only |
| **GET /accesslog/denied** | ✅ | ❌ | ❌ | Admin only (security) |
| **GET /accesslog/anomalies** | ✅ | ❌ | ❌ | Admin only (security) |
| **POST /accesslog** | 🔸 | 🔸 | 🔸 | Created by BMS system automatically |
| **PUT /accesslog/{id}** | ❌ | ❌ | ❌ | Immutable audit log |
| **DELETE /accesslog/{id}** | ❌ | ❌ | ❌ | Immutable audit log |

**Immutable Audit Log**: Access logs cannot be modified or deleted. Created automatically by BMS devices.

**Security Alert**: Failed access attempts and anomalies should trigger real-time notifications to admins.

---

### 11. **IOT METRICS** (iot.iot_metrics)

| Operation | Admin | Member | Viewer | Notes |
|-----------|-------|--------|--------|-------|
| **GET /iotmetric/{id}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /iotmetric** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /iotmetric/device/{deviceId}** | ✅ | ✅ | ✅ | 🔒 Company's devices only |
| **GET /iotmetric/property/{propertyId}** | ✅ | ✅ | ✅ | 🔒 Company's properties only |
| **GET /iotmetric/type/{metricType}** | ✅ | ✅ | ✅ | 🔒 Filtered by company_id |
| **GET /iotmetric/alerts** | ✅ | ✅ | ✅ | 🔒 Company's alerts only |
| **POST /iotmetric** | 🔸 | 🔸 | 🔸 | Created by BMS system automatically |
| **PUT /iotmetric/{id}** | ❌ | ❌ | ❌ | Time-series data (immutable) |
| **DELETE /iotmetric/{id}** | ✅ | ❌ | ❌ | Admin: cleanup old data only |

**Time-Series Data**: Metrics are historical records. Typically immutable except for data retention cleanup.

**Performance**: Use time-range queries and indexes. May contain millions of rows.

---

## 🔐 Special Operations

### Document Approval Workflow

| Operation | Endpoint | Admin | Member | Viewer | Description |
|-----------|----------|-------|--------|--------|-------------|
| **Submit for Approval** | `POST /document/{id}/submit` | ✅ | ✅ | ❌ | Changes status: draft → pending |
| **Approve Document** | `POST /document/{id}/approve` | ✅ | ❌ | ❌ | Changes status: pending → approved |
| **Reject Document** | `POST /document/{id}/reject` | ✅ | ❌ | ❌ | Changes status: pending → rejected |
| **Revert to Draft** | `POST /document/{id}/revert` | ✅ | 🔸 | ❌ | Member: own docs only |

### User Management

| Operation | Endpoint | Admin | Member | Viewer | Description |
|-----------|----------|-------|--------|--------|-------------|
| **Add User to Company** | `POST /company/{id}/users` | ✅ | ❌ | ❌ | Creates user_companies entry |
| **Remove User from Company** | `DELETE /company/{id}/users/{userId}` | ✅ | ❌ | ❌ | Deletes user_companies entry |
| **Change User Role** | `PUT /company/{id}/users/{userId}/role` | ✅ | ❌ | ❌ | Updates role in user_companies |
| **Get Company Users** | `GET /company/{id}/users` | ✅ | ✅ | ✅ | Lists all users in company |

### Soft Delete Operations

| Entity | Soft Delete Field | Admin | Member | Viewer | Notes |
|--------|------------------|-------|--------|--------|-------|
| **Documents** | `deleted_at` | ✅ | 🔸 | ❌ | Members: own docs only |
| **BMS Devices** | `deleted_at` | ✅ | ❌ | ❌ | Admin only |
| **Properties** | N/A | ❌ | ❌ | ❌ | No soft delete (use status) |

**Soft Delete**: Sets `deleted_at` timestamp. Record remains in database but excluded from queries.

---

## 🏢 Multi-Tenancy Rules

### Tenant Isolation Enforcement

**Rule 1: Company ID Required**
```csharp
// ✅ CORRECT: Always filter by company_id
var documents = await _db.Documents
    .Where(d => d.CompanyId == currentUserCompanyId)
    .ToListAsync();

// ❌ WRONG: No company filter (cross-tenant leak!)
var documents = await _db.Documents.ToListAsync();
```

**Rule 2: Validate User Belongs to Company**
```csharp
// Before any operation, verify user has access to this company
var userCompany = await _db.UserCompanies
    .FirstOrDefaultAsync(uc =>
        uc.UserId == currentUserId &&
        uc.CompanyId == requestedCompanyId);

if (userCompany == null)
    return Forbid(); // User doesn't belong to this company
```

**Rule 3: Check Role Permissions**
```csharp
// Verify user has required role for operation
if (userCompany.Role != "admin")
    return Forbid(); // Only admins can perform this action
```

### Cross-Company Access

**Multi-Company Users**:
- Users can belong to multiple companies via `user_companies` table
- Each company membership has its own role
- User must explicitly select which company context they're operating in
- UI should show company selector for multi-company users

**Example: Sarah's Access**
```sql
-- Sarah's company memberships
SELECT company_id, role FROM user_companies WHERE user_id = 'sarah-id';

-- Results:
company_id          | role
--------------------|-------
agritech-lp-id      | admin     -- Full access to Agritech data
havenztech-id       | member    -- Standard access to Havenz Tech data
energy-haven-lp-id  | viewer    -- Read-only access to Energy Haven data
```

---

## 🛠️ Implementation Guidelines

### Backend Implementation (ASP.NET Core)

#### 1. **Create Authorization Attributes**

```csharp
// Attributes/RequireRoleAttribute.cs
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class RequireRoleAttribute : AuthorizeAttribute, IAuthorizationFilter
{
    private readonly string[] _roles;

    public RequireRoleAttribute(params string[] roles)
    {
        _roles = roles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        var companyId = context.HttpContext.Request.Headers["X-Company-Id"].ToString();

        if (string.IsNullOrEmpty(companyId))
        {
            context.Result = new BadRequestObjectResult("Company ID required");
            return;
        }

        // Get user's role for this company
        var dbContext = context.HttpContext.RequestServices
            .GetService<HavenzHubContext>();

        var userCompany = dbContext.UserCompanies
            .FirstOrDefault(uc =>
                uc.UserId == GetCurrentUserId(user) &&
                uc.CompanyId == Guid.Parse(companyId));

        if (userCompany == null || !_roles.Contains(userCompany.Role))
        {
            context.Result = new ForbidResult();
        }
    }
}
```

#### 2. **Apply to Controllers**

```csharp
[ApiController]
[Route("api/havenzhub/[controller]")]
public class DocumentController : ControllerBase
{
    // Only admins and members can upload
    [HttpPost]
    [RequireRole("admin", "member")]
    public async Task<ActionResult<Document>> Post([FromBody] Document document)
    {
        // Implementation
    }

    // Anyone can view (filtered by company)
    [HttpGet]
    [RequireRole("admin", "member", "viewer")]
    public async Task<ActionResult<IEnumerable<Document>>> GetAll()
    {
        var companyId = GetCurrentCompanyId();
        var userRole = GetCurrentUserRole();

        var query = _db.Documents.Where(d => d.CompanyId == companyId);

        // Viewers only see approved documents
        if (userRole == "viewer")
        {
            query = query.Where(d => d.Status == "approved");
        }

        return await query.ToListAsync();
    }

    // Only admins can approve
    [HttpPost("{id}/approve")]
    [RequireRole("admin")]
    public async Task<ActionResult> ApproveDocument(Guid id)
    {
        // Implementation
    }
}
```

#### 3. **Create Base Controller**

```csharp
public class SecureControllerBase : ControllerBase
{
    protected readonly HavenzHubContext _db;

    protected Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userId);
    }

    protected Guid GetCurrentCompanyId()
    {
        var companyId = Request.Headers["X-Company-Id"].ToString();
        if (string.IsNullOrEmpty(companyId))
            throw new BadHttpRequestException("Company ID required");
        return Guid.Parse(companyId);
    }

    protected async Task<string> GetCurrentUserRole()
    {
        var userId = GetCurrentUserId();
        var companyId = GetCurrentCompanyId();

        var userCompany = await _db.UserCompanies
            .FirstOrDefaultAsync(uc =>
                uc.UserId == userId &&
                uc.CompanyId == companyId);

        return userCompany?.Role ?? throw new UnauthorizedAccessException();
    }

    protected async Task<bool> ValidateCompanyAccess(Guid companyId)
    {
        var userId = GetCurrentUserId();
        return await _db.UserCompanies
            .AnyAsync(uc => uc.UserId == userId && uc.CompanyId == companyId);
    }
}
```

### Frontend Implementation (TypeScript/React)

#### 1. **User Context with Role**

```typescript
// contexts/UserContext.tsx
interface UserCompany {
  companyId: string;
  companyName: string;
  role: 'admin' | 'member' | 'viewer';
}

interface UserContext {
  userId: string;
  email: string;
  companies: UserCompany[];
  currentCompany: UserCompany;
  switchCompany: (companyId: string) => void;
}

export const UserProvider = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<UserCompany | null>(null);

  // All API calls include X-Company-Id header
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      'X-Company-Id': currentCompany?.companyId
    }
  });

  return (
    <UserContext.Provider value={{ currentCompany, apiClient, ... }}>
      {children}
    </UserContext.Provider>
  );
};
```

#### 2. **Permission Checks**

```typescript
// hooks/usePermissions.ts
export const usePermissions = () => {
  const { currentCompany } = useUserContext();

  return {
    canCreate: ['admin', 'member'].includes(currentCompany?.role),
    canUpdate: ['admin', 'member'].includes(currentCompany?.role),
    canDelete: currentCompany?.role === 'admin',
    canApprove: currentCompany?.role === 'admin',
    isAdmin: currentCompany?.role === 'admin',
    isMember: currentCompany?.role === 'member',
    isViewer: currentCompany?.role === 'viewer',
  };
};
```

#### 3. **Conditional UI Rendering**

```typescript
// components/DocumentList.tsx
export const DocumentList = () => {
  const { canApprove, canUpload } = usePermissions();

  return (
    <div>
      {canUpload && (
        <Button onClick={handleUpload}>
          Upload Document
        </Button>
      )}

      {canApprove && (
        <Button onClick={handleApprove}>
          Approve Document
        </Button>
      )}

      <DocumentTable />
    </div>
  );
};
```

---

## 🔒 Security Considerations

### 1. **Defense in Depth**

**Multiple Security Layers**:
1. ✅ **Frontend**: Hide UI elements user can't access
2. ✅ **API Gateway**: Validate JWT tokens
3. ✅ **Backend**: Enforce permissions in controllers
4. ✅ **Database**: Row-level security (RLS) as fallback

**Never trust frontend validation alone!** Always validate permissions on the backend.

### 2. **Common Vulnerabilities**

| Vulnerability | Description | Mitigation |
|---------------|-------------|------------|
| **Cross-Tenant Leak** | User accesses another company's data | Always filter by company_id |
| **Privilege Escalation** | User performs action above their role | Check role before operations |
| **IDOR** | Direct object reference without auth check | Validate object belongs to user's company |
| **Mass Assignment** | User modifies fields they shouldn't | Use DTOs, whitelist fields |

### 3. **Audit Logging**

**Log all sensitive operations**:
```csharp
await _auditLog.LogAsync(new AuditEntry
{
    UserId = currentUserId,
    CompanyId = currentCompanyId,
    Action = "document.approve",
    EntityType = "Document",
    EntityId = documentId,
    IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
    Timestamp = DateTime.UtcNow
});
```

**What to log**:
- Document approvals/rejections
- User role changes
- BMS device configuration changes
- Facial recognition enrollments
- Failed authorization attempts
- Cross-company access attempts

### 4. **Rate Limiting**

**Prevent abuse**:
- API rate limiting per user/company
- Exponential backoff on failed login attempts
- CAPTCHA after multiple failed authorizations

---

## 📈 Testing Checklist

### Unit Tests

- [ ] Role-based access control for each entity
- [ ] Company isolation (users can't access other companies)
- [ ] Viewer can only see approved documents
- [ ] Members can't approve documents
- [ ] Members can only edit their own uploads
- [ ] Admins can perform all operations

### Integration Tests

- [ ] Multi-company user can switch contexts
- [ ] API returns 403 Forbidden for unauthorized actions
- [ ] API returns 404 Not Found (not 403) for cross-tenant access
- [ ] Soft delete excludes records from queries
- [ ] Cascade deletes work correctly

### Security Tests

- [ ] JWT token validation
- [ ] Company ID header required and validated
- [ ] SQL injection prevention
- [ ] Mass assignment prevention
- [ ] IDOR (Insecure Direct Object Reference) prevention

---

## 📝 Summary

### Quick Reference

**Admin**: Full control
- ✅ Everything

**Member**: Operational access
- ✅ Create/Update: Projects, Documents, BMS operational updates
- ✅ View: Everything in their company
- ❌ Delete, Approve, User management, BMS configuration

**Viewer**: Read-only
- ✅ View: Approved documents, public information
- ❌ Everything else

### Implementation Priority

1. **Phase 1 - Foundation**:
   - Authentication (JWT)
   - Company context (X-Company-Id header)
   - Base authorization attributes

2. **Phase 2 - Core Entities**:
   - Users, Companies, Departments
   - Documents with approval workflow

3. **Phase 3 - IoT/BMS**:
   - BMS Devices, Access Logs, IoT Metrics
   - Facial Recognition (GDPR compliance)

4. **Phase 4 - Advanced**:
   - Audit logging
   - Rate limiting
   - Row-level security

---

**Document Version**: 1.0
**Last Updated**: October 28, 2025
**Status**: Ready for Implementation
**Next Steps**: Implement authorization attributes in backend controllers
