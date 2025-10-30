# Testing Guide

## Overview

This guide covers testing the HavenzBMS API, including authentication, authorization, and CRUD operations.

## Prerequisites

1. Docker and Docker Compose installed
2. Database running with seeded test data
3. API running on `http://localhost:5087`

If you haven't set up the environment yet, see [Quick Start](../setup/QUICK_START.md).

## Test Credentials

### Agritech Haven LP (Company)

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | sarah.johnson@agritech.com | Password123! | Sarah Johnson |
| Member | lisa.martinez@agritech.com | Password123! | Lisa Martinez |
| Viewer | amanda.garcia@agritech.com | Password123! | Amanda Garcia |

**Company ID**: `0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a`

For complete test credentials, see [Testing Credentials](../setup/TESTING_CREDENTIALS.md).

## Authentication

### 1. Login

```bash
# Login as Admin
curl -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@agritech.com",
    "password": "Password123!"
  }'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "guid",
  "email": "sarah.johnson@agritech.com",
  "name": "Sarah Johnson",
  "companies": [
    {
      "companyId": "0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a",
      "companyName": "Agritech Haven LP",
      "role": "admin"
    }
  ],
  "expiresAt": "2025-10-31T00:00:00Z"
}
```

### 2. Save the Token

Save the token for subsequent requests:

```bash
# Extract token (Linux/Mac)
TOKEN=$(curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d @test_admin.json | jq -r '.token')

echo $TOKEN

# Or manually copy the token from the response
```

### 3. Using the Token

Include the token in all API requests:

```bash
curl -X GET "http://localhost:5087/api/havenzhub/project" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
```

## Testing Authorization

### Role Permissions

Test different operations with different roles to verify authorization:

#### Admin Role

```bash
# Login as Admin
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@agritech.com","password":"Password123!"}' \
  > admin_token.json

# Create project (should succeed)
curl -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $(cat admin_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test Project",
    "status": "planning",
    "priority": "high"
  }'
# Expected: 201 Created

# Delete project (should succeed)
curl -X DELETE http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $(cat admin_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
# Expected: 204 No Content
```

#### Member Role

```bash
# Login as Member
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lisa.martinez@agritech.com","password":"Password123!"}' \
  > member_token.json

# Create project (should succeed)
curl -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $(cat member_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Member Test Project",
    "status": "planning"
  }'
# Expected: 201 Created

# Update project (should succeed)
curl -X PUT http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $(cat member_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<project-id>",
    "name": "Updated Project",
    "status": "active",
    "priority": "medium"
  }'
# Expected: 204 No Content

# Delete project (should fail)
curl -X DELETE http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $(cat member_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
# Expected: 403 Forbidden
```

#### Viewer Role

```bash
# Login as Viewer
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amanda.garcia@agritech.com","password":"Password123!"}' \
  > viewer_token.json

# View projects (should succeed)
curl -X GET http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $(cat viewer_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
# Expected: 200 OK

# Create project (should fail)
curl -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $(cat viewer_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Viewer Test Project",
    "status": "planning"
  }'
# Expected: 401 Unauthorized or 403 Forbidden

# Update project (should fail)
curl -X PUT http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $(cat viewer_token.json | jq -r '.token')" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 401 Unauthorized or 403 Forbidden
```

## Testing Document Filtering

Viewers should only see approved documents:

```bash
# Login as Member (sees all documents)
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lisa.martinez@agritech.com","password":"Password123!"}' \
  | jq -r '.token' > mt.txt

curl -X GET http://localhost:5087/api/havenzhub/document \
  -H "Authorization: Bearer $(cat mt.txt)" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  | jq 'length'
# Expected: 7 documents (approved, pending, rejected)

# Login as Viewer (sees only approved)
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amanda.garcia@agritech.com","password":"Password123!"}' \
  | jq -r '.token' > vt.txt

curl -X GET http://localhost:5087/api/havenzhub/document \
  -H "Authorization: Bearer $(cat vt.txt)" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  | jq 'length'
# Expected: 5 documents (approved only)

# Verify all are approved
curl -X GET http://localhost:5087/api/havenzhub/document \
  -H "Authorization: Bearer $(cat vt.txt)" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  | jq '.[].status'
# Expected: All responses should be "approved"
```

## Testing CRUD Operations

### Create (POST)

```bash
curl -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Testing POST operation",
    "status": "planning",
    "priority": "medium",
    "progress": 0,
    "startDate": "2025-01-01T00:00:00Z",
    "budgetAllocated": 100000.00
  }'
```

**Expected Response**: 201 Created
- Returns created project with server-generated `id`, `companyId`, `createdAt`, `updatedAt`

### Read (GET)

```bash
# Get all projects
curl -X GET http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"

# Get specific project
curl -X GET http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
```

**Expected Response**: 200 OK

### Update (PUT)

```bash
curl -X PUT http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<project-id>",
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "active",
    "priority": "high",
    "progress": 50,
    "startDate": "2025-01-01T00:00:00Z",
    "budgetAllocated": 150000.00
  }'
```

**Expected Response**: 204 No Content

### Delete (DELETE)

```bash
curl -X DELETE http://localhost:5087/api/havenzhub/project/<project-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a"
```

**Expected Response**: 204 No Content

## Testing Multi-Tenant Isolation

### Attempt Cross-Company Access

```bash
# Login to Company A
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@companyA.com","password":"Password123!"}' \
  > tokenA.json

# Create project in Company A
PROJECT_A=$(curl -s -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $(cat tokenA.json | jq -r '.token')" \
  -H "X-Company-Id: <company-a-id>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Company A Project","status":"planning"}' \
  | jq -r '.id')

# Login to Company B
curl -s -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@companyB.com","password":"Password123!"}' \
  > tokenB.json

# Attempt to access Company A's project from Company B (should fail)
curl -X GET http://localhost:5087/api/havenzhub/project/$PROJECT_A \
  -H "Authorization: Bearer $(cat tokenB.json | jq -r '.token')" \
  -H "X-Company-Id: <company-b-id>"
# Expected: 404 Not Found (prevents information leakage)
```

## Common HTTP Status Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful PUT/DELETE request |
| 400 | Bad Request | Invalid request data, validation failed |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist or belongs to different company |
| 500 | Internal Server Error | Server-side error (check logs) |

## Troubleshooting

### 401 Unauthorized
- Check token is included in `Authorization: Bearer <token>` header
- Token may be expired (login again)
- Check token format is correct

### 403 Forbidden
- User doesn't have required role for this operation
- Check `X-Company-Id` header matches user's company

### 400 Bad Request with Validation Errors
- Check request body matches DTO requirements
- See validation error details in response

### 404 Not Found
- Resource doesn't exist
- Resource belongs to different company (security measure)

## Using Test Files

Create test data files for convenience:

**test_admin.json**:
```json
{
  "email": "sarah.johnson@agritech.com",
  "password": "Password123!"
}
```

**test_project.json**:
```json
{
  "name": "Test Project",
  "description": "Project for testing",
  "status": "planning",
  "priority": "medium",
  "progress": 0,
  "budgetAllocated": 100000.00
}
```

Then use them:
```bash
curl -X POST http://localhost:5087/api/auth/login \
  -H "Content-Type: application/json" \
  -d @test_admin.json

curl -X POST http://localhost:5087/api/havenzhub/project \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: 0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a" \
  -H "Content-Type: application/json" \
  -d @test_project.json
```

## Running Unit Tests

```bash
# Run all tests
dotnet test

# Run with detailed output
dotnet test --verbosity normal

# Run specific test project
dotnet test WebApp.Test/WebApp.Test.csproj

# Run specific test class
dotnet test --filter "FullyQualifiedName~ProjectControllerTests"
```

## See Also

- [Authorization Guide](./AUTHORIZATION.md) - Authentication and authorization
- [DTO Pattern](./DTO_PATTERN.md) - Request DTOs for POST/PUT
- [Permission Matrix](../architecture/PERMISSION_MATRIX.md) - Complete permission matrix
- [Test Credentials](../setup/TESTING_CREDENTIALS.md) - All test user accounts
