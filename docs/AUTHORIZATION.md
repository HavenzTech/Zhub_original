# Authorization & Authentication

## Overview

HavenzBMS uses **JWT (JSON Web Tokens)** for authentication and **role-based authorization** for access control. The system enforces multi-tenant isolation, ensuring users can only access data from their assigned companies.

## Authentication Flow

### 1. User Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@company.com",
  "password": "Password123!"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "guid",
  "email": "user@company.com",
  "name": "User Name",
  "companies": [
    {
      "companyId": "guid",
      "companyName": "Company Name",
      "role": "admin"
    }
  ],
  "expiresAt": "2025-10-30T03:00:00Z"
}
```

### 2. Making Authenticated Requests

Include the token in the `Authorization` header and the `X-Company-Id` header:

```bash
curl -X GET "http://localhost:5087/api/havenzhub/project" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
```

## JWT Token Structure

The JWT token contains:

```json
{
  "user_id": "guid",
  "email": "user@company.com",
  "name": "User Name",
  "company_id": "guid",
  "role_<company_id>": "admin",
  "exp": 1735531200
}
```

**Key Claims**:
- `user_id`: User's unique identifier
- `company_id`: Current company context
- `role_<company_id>`: User's role in this specific company
- `exp`: Token expiration (Unix timestamp)

## Role-Based Access Control

### Roles

HavenzBMS has three roles with hierarchical permissions:

| Role | Access Level | Description |
|------|--------------|-------------|
| **admin** | Full access | Create, read, update, delete all resources |
| **member** | Read/write | Create and update most resources, read everything |
| **viewer** | Read-only | View approved/public resources only |

### Permission Matrix

| Resource | Admin | Member | Viewer |
|----------|-------|--------|--------|
| **Company** | CRUD | R | R |
| **User** | CRUD | RU (self) | R |
| **Department** | CRUD | RU | R |
| **Project** | CRUD | CRU | R |
| **Property** | CRUD | CRU | R |
| **Document** | CRUD | CRU | R (approved only) |
| **BMS Device** | CRUD | RU | R |
| **Access Log** | CRD | R | R |
| **IoT Metric** | CRD | CR | R |
| **Facial Recognition** | CRUD | R | R |

**Legend**: C = Create, R = Read, U = Update, D = Delete

## Implementing Authorization in Controllers

### Using the `[RequireRole]` Attribute

Controllers use the `RequireRoleAttribute` to enforce authorization:

```csharp
using WebApp.Attributes;

[ApiController]
[Route("api/havenzhub/[controller]")]
public class ProjectController : SecureControllerBase
{
    // Viewers, members, and admins can view projects
    [HttpGet]
    [RequireRole("admin", "member", "viewer")]
    public async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        var companyId = GetCurrentCompanyId();
        var projects = await _repository.GetProjectsByCompanyIdAsync(companyId);
        return Ok(projects);
    }

    // Only admins and members can create projects
    [HttpPost]
    [RequireRole("admin", "member")]
    public async Task<ActionResult<Project>> Post([FromBody] CreateProjectRequest request)
    {
        var companyId = GetCurrentCompanyId();
        // ... create project
    }

    // Only admins can delete projects
    [HttpDelete("{id}")]
    [RequireRole("admin")]
    public async Task<ActionResult> Delete(Guid id)
    {
        // ... delete project
    }
}
```

### SecureControllerBase Helper Methods

All controllers inherit from `SecureControllerBase`, which provides:

```csharp
// Get current user's ID from JWT token
protected Guid GetCurrentUserId()

// Get current company ID from X-Company-Id header
protected Guid GetCurrentCompanyId()

// Get current user's role in the current company
protected string GetCurrentRole()

// Get current user's email
protected string GetCurrentUserEmail()
```

## Multi-Tenant Isolation

### Company Context

Every authenticated request must include the `X-Company-Id` header. The middleware validates:

1. User belongs to the specified company
2. Token contains the matching company_id claim
3. User has a role assigned in that company

### Data Filtering

Controllers automatically filter data by company:

```csharp
[HttpGet]
[RequireRole("admin", "member", "viewer")]
public async Task<ActionResult<IEnumerable<Project>>> GetAll()
{
    var companyId = GetCurrentCompanyId(); // From X-Company-Id header

    // Only returns projects belonging to this company
    var projects = await _repository.GetProjectsByCompanyIdAsync(companyId);

    return Ok(projects);
}
```

### Cross-Company Access Prevention

When accessing a specific resource by ID:

```csharp
[HttpGet("{id}")]
[RequireRole("admin", "member", "viewer")]
public async Task<ActionResult<Project>> GetById(Guid id)
{
    var project = await _repository.SearchByIdAsync(id);
    if (project == null)
        return NotFound();

    var companyId = GetCurrentCompanyId();

    // Validate the project belongs to the user's company
    if (project.CompanyId != companyId)
    {
        _logger.LogWarning(
            "User {UserId} attempted to access project {ProjectId} from different company",
            GetCurrentUserId(), id);
        return NotFound(); // Return 404 instead of 403 to avoid information leakage
    }

    return Ok(project);
}
```

## Special Authorization Rules

### Document Access (Viewer Role)

Viewers can only see **approved** documents. The `DocumentController` implements this filter:

```csharp
[HttpGet]
[RequireRole("admin", "member", "viewer")]
public async Task<ActionResult<IEnumerable<Document>>> GetAll()
{
    var companyId = GetCurrentCompanyId();
    var role = GetCurrentRole();

    var documents = await _repository.GetDocumentsByCompanyIdAsync(companyId);

    // Viewers only see approved documents
    if (role == "viewer")
    {
        documents = documents.Where(d => d.Status == "approved");
    }

    return Ok(documents);
}
```

### User Self-Update

Members can update their own user profile but not other users:

```csharp
[HttpPut("{id}")]
[RequireRole("admin", "member")]
public async Task<ActionResult> Put(Guid id, [FromBody] UpdateUserRequest request)
{
    var currentUserId = GetCurrentUserId();
    var role = GetCurrentRole();

    // Members can only update themselves
    if (role == "member" && id != currentUserId)
    {
        return Forbid();
    }

    // ... proceed with update
}
```

## Security Best Practices

### 1. Password Hashing

Passwords are hashed using **BCrypt** before storage:

```csharp
using BCrypt.Net;

// During registration
string hashedPassword = BCrypt.HashPassword(request.Password);

// During login
bool isValid = BCrypt.Verify(request.Password, user.PasswordHash);
```

### 2. Token Expiration

JWT tokens expire after **24 hours**. Configure in `appsettings.json`:

```json
{
  "Jwt": {
    "Secret": "your-secret-key-min-32-chars",
    "Issuer": "HavenzHub",
    "Audience": "HavenzHubAPI",
    "ExpirationMinutes": 1440
  }
}
```

### 3. HTTPS in Production

Always use HTTPS in production. The API redirects HTTP to HTTPS:

```csharp
app.UseHttpsRedirection();
```

### 4. Logging Security Events

Security events are logged for audit purposes:

```csharp
_logger.LogWarning(
    "User {UserId} attempted to access project {ProjectId} from different company",
    GetCurrentUserId(), id);
```

## Testing Authorization

### Test Credentials (Development Only)

```
Admin:
- Email: sarah.johnson@agritech.com
- Password: Password123!
- Company: Agritech Haven LP

Member:
- Email: lisa.martinez@agritech.com
- Password: Password123!
- Company: Agritech Haven LP

Viewer:
- Email: amanda.garcia@agritech.com
- Password: Password123!
- Company: Agritech Haven LP
```

### Example Test Scenarios

```bash
# 1. Login as member
curl -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lisa.martinez@agritech.com","password":"Password123!"}'

# 2. Create project (should succeed - members can create)
curl -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer <token>" \
  -H "X-Company-Id: <company-id>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","status":"planning"}'

# 3. Delete project (should fail - only admins can delete)
curl -X DELETE http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer <token>" \
  -H "X-Company-Id: <company-id>"
# Expected: 403 Forbidden
```

## Troubleshooting

### 401 Unauthorized

**Problem**: Request returns 401
**Causes**:
- Missing `Authorization` header
- Invalid or expired token
- Token signature doesn't match

**Solution**: Login again to get a fresh token

### 403 Forbidden

**Problem**: Request returns 403
**Causes**:
- User's role doesn't have permission for this operation
- User trying to access another company's data

**Solution**: Check user's role and ensure correct `X-Company-Id` header

### Missing X-Company-Id Header

**Problem**: Request fails with error about missing company context
**Solution**: Always include `X-Company-Id` header in requests

## File Locations

- **Middleware**: `WebApp/Middleware/CompanyContextMiddleware.cs`
- **Attributes**: `WebApp/Attributes/RequireRoleAttribute.cs`
- **Base Controller**: `WebApp/Controllers/Base/SecureControllerBase.cs`
- **Auth Service**: `WebApp/Services/Auth/AuthService.cs`
- **JWT Service**: `WebApp/Services/Auth/JwtService.cs`

## See Also

- [DTO Pattern](./DTO_PATTERN.md) - Request/response DTOs
- [Permission Matrix](../architecture/PERMISSION_MATRIX.md) - Complete permission matrix
- [Testing Guide](./TESTING_GUIDE.md) - Testing authorization
