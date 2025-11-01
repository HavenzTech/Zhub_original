# HavenzBMS API Reference for Frontend

Complete API documentation for frontend integration with HavenzBMS backend.

**Base URL**: `http://localhost:5000/api` (Development)

**API Version**: 1.0.0

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Health Check Endpoints](#health-check-endpoints)
4. [User Management](#user-management)
5. [Company Management](#company-management)
6. [Department Management](#department-management)
7. [Project Management](#project-management)
8. [Property Management](#property-management)
9. [Document Management](#document-management)
10. [BMS Device Management](#bms-device-management)
11. [Facial Recognition](#facial-recognition)
12. [Access Logs](#access-logs)
13. [IoT Metrics](#iot-metrics)
14. [DTOs and Models](#dtos-and-models)
15. [Error Handling](#error-handling)
16. [Best Practices](#best-practices)

---

## Authentication Overview

### Required Headers

All authenticated endpoints require:

```typescript
headers: {
  'Authorization': 'Bearer {JWT_TOKEN}',      // Required for all protected endpoints
  'X-Company-Id': '{COMPANY_GUID}',          // Required for all HavenzHub endpoints
  'Content-Type': 'application/json'
}
```

### Role-Based Access Control

The system has three role levels:

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD access within their company |
| **member** | Read all, create and update most resources, limited delete |
| **viewer** | Read-only access (can only see approved documents) |

---

## Authentication Endpoints

Base URL: `/api/auth`

### 1. Login

**POST** `/api/auth/login`

Login with email and password to receive JWT token.

**Authentication**: None (Public)

**Request Body**:
```typescript
{
  email: string;          // Required, valid email format
  password: string;       // Required, min 6 characters
}
```

**Success Response (200)**:
```typescript
{
  token: string;          // JWT Bearer token - use in Authorization header
  userId: string;         // User's GUID
  email: string;
  name: string;
  companies: [
    {
      companyId: string;      // GUID
      companyName: string;
      role: 'admin' | 'member' | 'viewer'
    }
  ],
  expiresAt: string;      // ISO 8601 datetime (UTC) - token expiration
}
```

**Error Responses**:
- `400`: Invalid request or validation error
- `401`: Invalid credentials

**Example**:
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'sarah.johnson@agritech.com',
    password: 'Password123!'
  })
});
const data = await response.json();
// Store data.token for subsequent requests
// Store data.companies[0].companyId for X-Company-Id header
```

---

### 2. Register

**POST** `/api/auth/register`

Register a new user account.

**Authentication**: None (Public)

**Request Body**:
```typescript
{
  email: string;              // Required, valid email, must be unique
  name: string;               // Required, min 2, max 255 characters
  password: string;           // Required, min 8 chars, must contain uppercase, lowercase, and number
  confirmPassword: string;    // Required, must match password
  companyId?: string;         // Optional GUID - join existing company
  role?: string;              // Optional, default: 'member'
}
```

**Success Response (201)**:
```typescript
{
  id: string;               // User GUID
  email: string;
  name: string;
  createdAt: string;        // ISO 8601 datetime
}
```

**Error Responses**:
- `400`: Invalid request or email already exists

**Example**:
```typescript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    name: 'John Doe',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!'
  })
});
```

---

### 3. Change Password

**POST** `/api/auth/change-password`

Change the current user's password.

**Authentication**: Required

**Headers**:
```typescript
{
  'Authorization': 'Bearer {token}'
}
```

**Request Body**:
```typescript
{
  currentPassword: string;    // Required
  newPassword: string;        // Required
}
```

**Success Response (200)**:
```typescript
{
  message: 'Password changed successfully'
}
```

**Error Responses**:
- `400`: Invalid request
- `401`: Invalid current password or token

---

### 4. Check Email Availability

**GET** `/api/auth/check-email?email={email}`

Check if an email is available for registration.

**Authentication**: None (Public)

**Query Parameters**:
- `email`: string (required)

**Success Response (200)**:
```typescript
{
  email: string;
  available: boolean;
}
```

**Example**:
```typescript
const response = await fetch('http://localhost:5000/api/auth/check-email?email=test@example.com');
const data = await response.json();
if (data.available) {
  // Email is available
}
```

---

## Health Check Endpoints

### 1. Basic Health Check

**GET** `/health`

Check if the API is running.

**Authentication**: None

**Success Response (200)**:
```typescript
{
  status: 'healthy';
  timestamp: string;        // ISO 8601 datetime
  service: 'Havenz Hub API';
  version: '1.0.0';
}
```

---

### 2. Deep Health Check

**GET** `/health/deep`

Check API and database connectivity.

**Authentication**: None

**Success Response (200)**:
```typescript
{
  status: 'healthy';
  timestamp: string;
  service: 'Havenz Hub API';
  version: '1.0.0';
  database: {
    status: 'connected';
    userCount: number;
  }
}
```

**Error Response (503)**:
```typescript
{
  status: 'unhealthy';
  timestamp: string;
  service: 'Havenz Hub API';
  version: '1.0.0';
  database: {
    status: 'error' | 'disconnected';
    error: string;
  }
}
```

---

## User Management

Base URL: `/api/havenzhub/user`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Get User by ID

**GET** `/api/havenzhub/user/{id}`

Get a specific user by their ID.

**Roles**: admin, member, viewer

**Success Response (200)**:
```typescript
{
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Note**: Password hash is never exposed in responses.

---

### 2. Get All Users in Company

**GET** `/api/havenzhub/user`

Get all users in the current company.

**Roles**: admin, member, viewer

**Success Response (200)**: Array of User objects

---

### 3. Get User by Email

**GET** `/api/havenzhub/user/email/{email}`

Get a user by their email address.

**Roles**: admin only

**Success Response (200)**: User object

---

### 4. Get Users by Company

**GET** `/api/havenzhub/user/company/{companyId}`

Get all users in a specific company.

**Roles**: admin, member, viewer

**Note**: companyId must match X-Company-Id header

---

### 5. Create User

**POST** `/api/havenzhub/user`

Create a new user (for admin use - public registration should use `/api/auth/register`).

**Roles**: admin only

**Request Body**:
```typescript
{
  email: string;          // Required, max 255
  name: string;           // Required, max 255
  pictureUrl?: string;    // Optional, max 500
}
```

---

### 6. Update User

**PUT** `/api/havenzhub/user/{id}`

Update a user's profile.

**Roles**: admin (any user), member (own profile only)

**Request Body**: User object with matching id

**Note**: Password cannot be changed via this endpoint (use `/api/auth/change-password`)

---

### 7. Delete User

**DELETE** `/api/havenzhub/user/{id}`

Delete a user from the system.

**Roles**: admin only

**Note**: Cannot delete your own account

**Success Response (204)**: No content

---

## Company Management

Base URL: `/api/havenzhub/company`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Get Company by ID

**GET** `/api/havenzhub/company/{id}`

Get a specific company (user must belong to this company).

**Roles**: admin, member, viewer

**Success Response (200)**:
```typescript
{
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'pending';
  locationAddress?: string;
  locationCity?: string;
  locationProvince?: string;
  locationCountry?: string;
  locationPostalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  annualRevenue?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Get All User's Companies

**GET** `/api/havenzhub/company`

Get all companies the current user belongs to.

**Roles**: admin, member, viewer

**Success Response (200)**: Array of Company objects

---

### 3. Get Companies by Status

**GET** `/api/havenzhub/company/status/{status}`

Get companies by status (filtered to user's companies).

**Roles**: admin, member, viewer

**Path Parameters**:
- `status`: 'active' | 'inactive' | 'pending'

---

### 4. Get Companies by Industry

**GET** `/api/havenzhub/company/industry/{industry}`

Get companies by industry (filtered to user's companies).

**Roles**: admin, member, viewer

---

### 5. Get Companies for User

**GET** `/api/havenzhub/company/user/{userId}`

Get all companies for a specific user.

**Roles**: admin, member, viewer

**Note**: Non-admins can only query their own companies

---

### 6. Update Company

**PUT** `/api/havenzhub/company/{id}`

Update company information.

**Roles**: admin only (must belong to this company)

**Request Body**: Company object with matching id

---

## Department Management

Base URL: `/api/havenzhub/department`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Create Department

**POST** `/api/havenzhub/department`

Create a new department.

**Roles**: admin only

**Request Body**:
```typescript
{
  name: string;                 // Required, max 255
  description?: string;
  headName?: string;            // Max 255
  headEmail?: string;           // Max 255
  headPhone?: string;           // Max 50
  budgetAllocated?: number;     // Decimal
  budgetSpent?: number;         // Decimal
}
```

**Note**: companyId is automatically set from X-Company-Id header

**Success Response (201)**: Department object

---

### 2. Get Department by ID

**GET** `/api/havenzhub/department/{id}`

**Roles**: admin, member, viewer

---

### 3. Get All Departments

**GET** `/api/havenzhub/department`

Get all departments in the current company.

**Roles**: admin, member, viewer

---

### 4. Get Departments by Company

**GET** `/api/havenzhub/department/company/{companyId}`

**Roles**: admin, member, viewer

**Note**: companyId must match X-Company-Id

---

### 5. Search Departments

**GET** `/api/havenzhub/department/search/{name}`

Search departments by name (partial match).

**Roles**: admin, member, viewer

---

### 6. Update Department

**PUT** `/api/havenzhub/department/{id}`

**Roles**: admin only

**Request Body**: Department object with matching id

---

### 7. Delete Department

**DELETE** `/api/havenzhub/department/{id}`

**Roles**: admin only

**Success Response (204)**: No content

---

## Project Management

Base URL: `/api/havenzhub/project`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Create Project

**POST** `/api/havenzhub/project`

Create a new project.

**Roles**: admin, member

**Request Body**:
```typescript
{
  name: string;                 // Required, max 255
  description?: string;         // Max 1000
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';  // Default: 'planning'
  priority?: 'low' | 'medium' | 'high' | 'critical';  // Default: 'medium'
  progress?: number;            // 0-100, default: 0
  startDate?: string;           // ISO 8601 datetime
  endDate?: string;             // ISO 8601 datetime
  budgetAllocated?: number;     // Decimal >= 0
  budgetSpent?: number;         // Decimal >= 0
  teamLead?: string;            // Max 255
}
```

**Note**: companyId is automatically set from X-Company-Id header

**Success Response (201)**:
```typescript
{
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  teamLead?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Get Project by ID

**GET** `/api/havenzhub/project/{id}`

**Roles**: admin, member, viewer

---

### 3. Get All Projects

**GET** `/api/havenzhub/project`

Get all projects in the current company.

**Roles**: admin, member, viewer

---

### 4. Get Projects by Status

**GET** `/api/havenzhub/project/status/{status}`

**Roles**: admin, member, viewer

**Path Parameters**:
- `status`: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'

---

### 5. Get Projects by Priority

**GET** `/api/havenzhub/project/priority/{priority}`

**Roles**: admin, member, viewer

**Path Parameters**:
- `priority`: 'low' | 'medium' | 'high' | 'critical'

---

### 6. Get Projects by Date Range

**GET** `/api/havenzhub/project/daterange?startDate={start}&endDate={end}`

**Roles**: admin, member, viewer

**Query Parameters**:
- `startDate`: ISO 8601 datetime
- `endDate`: ISO 8601 datetime

---

### 7. Update Project

**PUT** `/api/havenzhub/project/{id}`

**Roles**: admin, member

**Request Body**:
```typescript
{
  id: string;                   // Required, must match path parameter
  name: string;                 // Required
  description?: string;
  status: string;
  priority: string;
  progress: number;             // 0-100
  startDate?: string;
  endDate?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  teamLead?: string;
}
```

**Success Response (204)**: No content

---

### 8. Delete Project

**DELETE** `/api/havenzhub/project/{id}`

**Roles**: admin only

**Success Response (204)**: No content

---

## Property Management

Base URL: `/api/havenzhub/property`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Create Property

**POST** `/api/havenzhub/property`

Create a new property.

**Roles**: admin only

**Request Body**:
```typescript
{
  name: string;                         // Required, max 255
  description?: string;
  type?: 'office' | 'warehouse' | 'datacenter' | 'residential' | 'industrial' | 'retail';
  status?: 'active' | 'inactive' | 'under-construction' | 'maintenance';  // Default: 'active'
  locationAddress?: string;
  locationCity?: string;                // Max 100
  locationProvince?: string;            // Max 50
  locationCountry?: string;             // Max 50
  locationPostalCode?: string;          // Max 20
  locationLatitude?: number;            // Decimal
  locationLongitude?: number;           // Decimal
  sizeTotalArea?: number;               // Decimal (square meters/feet)
  sizeUsableArea?: number;              // Decimal
  sizeFloors?: number;                  // Integer
  currentValue?: number;                // Decimal
  monthlyOperatingCosts?: number;       // Decimal
}
```

---

### 2. Get Property by ID

**GET** `/api/havenzhub/property/{id}`

**Roles**: admin, member, viewer

---

### 3. Get All Properties

**GET** `/api/havenzhub/property`

Get all properties in the current company.

**Roles**: admin, member, viewer

---

### 4. Get Properties by Type

**GET** `/api/havenzhub/property/type/{type}`

**Roles**: admin, member, viewer

---

### 5. Get Properties by Status

**GET** `/api/havenzhub/property/status/{status}`

**Roles**: admin, member, viewer

---

### 6. Get Properties by Location

**GET** `/api/havenzhub/property/location?city={city}&province={province}&country={country}`

**Roles**: admin, member, viewer

**Query Parameters** (all optional):
- `city`: string
- `province`: string
- `country`: string

---

### 7. Update Property

**PUT** `/api/havenzhub/property/{id}`

**Roles**: admin only

**Request Body**: Property object with matching id

---

### 8. Delete Property

**DELETE** `/api/havenzhub/property/{id}`

**Roles**: admin only

**Success Response (204)**: No content

---

## Document Management

Base URL: `/api/havenzhub/document`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Upload Document

**POST** `/api/havenzhub/document`

Upload a new document.

**Roles**: admin, member

**Request Body**:
```typescript
{
  name: string;                 // Required, max 500
  fileType?: string;            // Max 50 (pdf, docx, xlsx, etc.)
  fileSizeBytes?: number;
  contentHash?: string;         // SHA-256 hash, max 64
  storagePath?: string;
  version?: number;             // Default: 1
  accessLevel?: 'public' | 'private' | 'restricted';  // Default: 'private'
  category?: 'contract' | 'financial' | 'technical' | 'legal' | 'hr' | 'marketing' | 'other';
  metadata?: string;            // JSON string
  tags?: string;                // JSON string array
}
```

**Note**:
- companyId is automatically set from X-Company-Id
- uploadedByUserId is automatically set from current user
- status is automatically set to 'draft'

**Success Response (201)**: Document object

---

### 2. Get Document by ID

**GET** `/api/havenzhub/document/{id}`

**Roles**: admin, member, viewer

**Note**:
- Viewers can only see approved documents
- Members can see their own documents + approved documents
- Admins can see all documents

---

### 3. Get All Documents

**GET** `/api/havenzhub/document`

Get all documents in the current company.

**Roles**: admin, member, viewer

**Note**: Viewers only see approved documents

---

### 4. Get Documents by Status

**GET** `/api/havenzhub/document/status/{status}`

**Roles**: admin, member, viewer

**Path Parameters**:
- `status`: 'draft' | 'pending' | 'approved' | 'rejected'

**Note**: Viewers can only query 'approved' status

---

### 5. Get Documents by Uploader

**GET** `/api/havenzhub/document/uploader/{uploadedByUserId}`

**Roles**: admin, member

**Note**: Members can only see their own uploads

---

### 6. Update Document

**PUT** `/api/havenzhub/document/{id}`

**Roles**: admin, member (own documents only)

**Request Body**: Document object with matching id

---

### 7. Delete Document (Soft Delete)

**DELETE** `/api/havenzhub/document/{id}`

Soft delete a document (sets deletedAt timestamp).

**Roles**: admin, member (own documents only)

**Success Response (204)**: No content

---

### 8. Hard Delete Document

**DELETE** `/api/havenzhub/document/{id}/hard`

Permanently delete a document (use with caution).

**Roles**: admin only

**Success Response (204)**: No content

---

### 9. Approve Document

**POST** `/api/havenzhub/document/{id}/approve`

Approve a document (changes status to 'approved').

**Roles**: admin only

**Success Response (200)**:
```typescript
{
  message: 'Document approved successfully'
}
```

---

### 10. Reject Document

**POST** `/api/havenzhub/document/{id}/reject`

Reject a document (changes status to 'rejected').

**Roles**: admin only

**Request Body**:
```typescript
{
  reason?: string;
}
```

**Success Response (200)**:
```typescript
{
  message: 'Document rejected successfully'
}
```

---

## BMS Device Management

Base URL: `/api/havenzhub/bmsdevice`

**Required Headers**: `Authorization`, `X-Company-Id`

### 1. Register BMS Device

**POST** `/api/havenzhub/bmsdevice`

Register a new BMS device.

**Roles**: admin only

**Request Body**:
```typescript
{
  propertyId: string;                   // Required GUID
  name: string;                         // Required, max 255
  type: 'authenticator-phone' | 'authenticator-tablet' | 'access-control' | 'camera' | 'sensor' | 'controller';  // Required
  manufacturer?: string;                // Max 100
  model?: string;                       // Max 100
  serialNumber?: string;                // Max 100
  macAddress?: string;                  // Max 17 (AA:BB:CC:DD:EE:FF)
  ipAddress?: string;                   // Max 45
  firmwareVersion?: string;             // Max 50
  capabilities?: string;                // JSON string
  locationZone?: string;                // Max 100
  status: 'online' | 'offline' | 'maintenance' | 'error';
  batteryLevel?: number;                // 0-100
  signalStrength?: number;              // 0-100
  uptimePercentage?: number;            // 0-100
  lastHeartbeat?: string;               // ISO 8601 datetime
  installationDate?: string;            // ISO 8601 datetime
  warrantyExpiryDate?: string;          // ISO 8601 datetime
  maintenanceSchedule?: string;         // Max 50
  lastMaintenanceDate?: string;         // ISO 8601 datetime
  notes?: string;
}
```

**Note**: Property must belong to current company

---

### 2. Get Device by ID

**GET** `/api/havenzhub/bmsdevice/{id}`

**Roles**: admin, member, viewer

---

### 3. Get All Devices

**GET** `/api/havenzhub/bmsdevice`

Get all BMS devices in current company's properties.

**Roles**: admin, member, viewer

---

### 4. Get Devices by Property

**GET** `/api/havenzhub/bmsdevice/property/{propertyId}`

**Roles**: admin, member, viewer

---

### 5. Get Devices by Type

**GET** `/api/havenzhub/bmsdevice/type/{type}`

**Roles**: admin, member, viewer

---

### 6. Get Devices by Status

**GET** `/api/havenzhub/bmsdevice/status/{status}`

**Roles**: admin, member, viewer

---

### 7. Get Devices Requiring Maintenance

**GET** `/api/havenzhub/bmsdevice/maintenance/required`

**Roles**: admin, member, viewer

---

### 8. Update Device

**PUT** `/api/havenzhub/bmsdevice/{id}`

**Roles**: admin only

**Request Body**: BmsDevice object with matching id

---

### 9. Delete Device

**DELETE** `/api/havenzhub/bmsdevice/{id}`

Soft delete a device.

**Roles**: admin only

**Success Response (204)**: No content

---

## Facial Recognition

Base URL: `/api/havenzhub/facialrecognition`

**Required Headers**: `Authorization`, `X-Company-Id`

**⚠️ WARNING**: This endpoint handles sensitive biometric data - strict access controls required.

### 1. Enroll Facial Recognition

**POST** `/api/havenzhub/facialrecognition`

Enroll facial recognition data for a user.

**Roles**: admin only

**Request Body**:
```typescript
{
  userId: string;                       // Required GUID
  faceEncoding: string;                 // Required Base64 encoded byte array
  encodingAlgorithm?: 'facenet' | 'dlib' | 'deepface' | 'insightface';  // Default: 'facenet'
  encodingVersion?: string;             // Max 20
  confidenceThreshold?: number;         // 0-1, default: 0.80
  qualityScore?: number;                // 0-1
  enrollmentPhotoUrl?: string;          // Max 500
  status?: 'active' | 'inactive' | 'expired' | 'pending';  // Default: 'active'
  expiryDate?: string;                  // ISO 8601 datetime
  notes?: string;
}
```

**Note**: User must belong to current company

---

### 2. Get Facial Recognition by ID

**GET** `/api/havenzhub/facialrecognition/{id}`

**Roles**: admin, member, viewer

**Note**: Users can view their own record, admins/members can view company records

---

### 3. Get All Facial Recognition Records

**GET** `/api/havenzhub/facialrecognition`

**Roles**: admin, member

---

### 4. Get Facial Recognition by User

**GET** `/api/havenzhub/facialrecognition/user/{userId}`

**Roles**: admin, member, viewer

---

### 5. Get Facial Recognition by Status

**GET** `/api/havenzhub/facialrecognition/status/{status}`

**Roles**: admin, member

---

### 6. Get Expired Records

**GET** `/api/havenzhub/facialrecognition/expired`

**Roles**: admin, member

---

### 7. Update Facial Recognition

**PUT** `/api/havenzhub/facialrecognition/{id}`

**Roles**: admin only

**Request Body**: FacialRecognition object with matching id

---

### 8. Delete Facial Recognition

**DELETE** `/api/havenzhub/facialrecognition/{id}`

Permanently delete facial recognition data.

**Roles**: admin only

**Success Response (204)**: No content

---

## Access Logs

Base URL: `/api/havenzhub/accesslog`

**Required Headers**: `Authorization`, `X-Company-Id`

**Note**: Access logs are immutable audit trails - updates are not allowed.

### 1. Create Access Log

**POST** `/api/havenzhub/accesslog`

Create an access log entry (usually created by system/devices).

**Roles**: admin only

**Request Body**:
```typescript
{
  userId?: string;                      // GUID, nullable for unidentified attempts
  propertyId: string;                   // Required GUID
  deviceId: string;                     // Required GUID
  accessType: 'entry' | 'exit' | 'denied' | 'tailgate' | 'forced';  // Required
  verificationMethod: 'facial-recognition' | 'rfid-card' | 'pin-code' | 'qr-code' | 'manual-override';  // Required
  confidenceScore?: number;             // 0-1
  accessGranted: boolean;               // Required
  denialReason?: string;                // Max 255
  anomalyDetected: boolean;             // Required
  anomalyType?: string;                 // Max 100
  locationZone?: string;                // Max 100
  direction?: 'in' | 'out';
  verificationDurationMs?: number;
  photoCapturedUrl?: string;            // Max 500
  videoClipUrl?: string;                // Max 500
  temperatureReading?: number;          // Decimal (°C)
  notes?: string;
}
```

**Note**: Property must belong to current company. Timestamp is automatically set.

---

### 2. Get Access Log by ID

**GET** `/api/havenzhub/accesslog/{id}`

**Roles**: admin, member, viewer

---

### 3. Get All Access Logs

**GET** `/api/havenzhub/accesslog`

Get all access logs for current company's properties.

**Roles**: admin, member, viewer

---

### 4. Get Access Logs by User

**GET** `/api/havenzhub/accesslog/user/{userId}`

**Roles**: admin, member, viewer

---

### 5. Get Access Logs by Property

**GET** `/api/havenzhub/accesslog/property/{propertyId}`

**Roles**: admin, member, viewer

---

### 6. Get Access Logs by Device

**GET** `/api/havenzhub/accesslog/device/{deviceId}`

**Roles**: admin, member, viewer

---

### 7. Get Access Logs by Type

**GET** `/api/havenzhub/accesslog/type/{accessType}`

**Roles**: admin, member, viewer

---

### 8. Get Access Logs by Date Range

**GET** `/api/havenzhub/accesslog/daterange?startDate={start}&endDate={end}`

**Roles**: admin, member, viewer

---

### 9. Get Anomalous Access Logs

**GET** `/api/havenzhub/accesslog/anomalous`

Get access logs with detected anomalies (critical for security monitoring).

**Roles**: admin, member, viewer

---

### 10. Get Denied Access Logs

**GET** `/api/havenzhub/accesslog/denied`

Get access logs where access was denied (critical for security monitoring).

**Roles**: admin, member, viewer

---

### 11. Delete Access Log

**DELETE** `/api/havenzhub/accesslog/{id}`

Delete an access log (use with extreme caution - audit trail).

**Roles**: admin only

**Success Response (204)**: No content

---

## IoT Metrics

Base URL: `/api/havenzhub/iotmetric`

**Required Headers**: `Authorization`, `X-Company-Id`

**Note**: IoT metrics are time-series data - updates are not allowed.

### 1. Record IoT Metric

**POST** `/api/havenzhub/iotmetric`

Record a new IoT metric (usually created by devices/system).

**Roles**: admin only

**Request Body**:
```typescript
{
  deviceId: string;                     // Required GUID
  propertyId: string;                   // Required GUID
  metricType: string;                   // Required, max 50 (see metric types below)
  value: number;                        // Required decimal
  unit?: '°C' | '°F' | 'V' | 'A' | 'W' | 'kWh' | '%' | 'lux' | 'dB' | 'ppm' | 'Pa' | 'L/min';
  alertTriggered?: boolean;             // Default: false
  alertSeverity?: 'info' | 'warning' | 'critical';
  thresholdMin?: number;
  thresholdMax?: number;
  qualityIndicator?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}
```

**Metric Types**:
- **Environmental**: temperature, humidity, air_quality_co2, air_quality_voc, air_quality_pm25, air_pressure, noise_level, light_level
- **Electrical**: voltage_ac, voltage_dc, current, power_consumption, energy_usage, power_factor, frequency
- **Security & Occupancy**: door_status, window_status, motion_detected, occupancy_count, camera_status, alarm_status
- **Equipment Health**: equipment_temp, vibration_level, water_detection, airflow_rate
- **Resources**: water_flow, water_pressure, gas_flow, waste_level

**Note**: Property must belong to current company. Timestamp is automatically set to now.

---

### 2. Get IoT Metric by ID

**GET** `/api/havenzhub/iotmetric/{id}`

**Roles**: admin, member, viewer

---

### 3. Get All IoT Metrics

**GET** `/api/havenzhub/iotmetric`

Get all IoT metrics for current company's properties.

**Roles**: admin, member, viewer

---

### 4. Get IoT Metrics by Device

**GET** `/api/havenzhub/iotmetric/device/{deviceId}`

**Roles**: admin, member, viewer

---

### 5. Get IoT Metrics by Property

**GET** `/api/havenzhub/iotmetric/property/{propertyId}`

**Roles**: admin, member, viewer

---

### 6. Get IoT Metrics by Type

**GET** `/api/havenzhub/iotmetric/type/{metricType}`

**Roles**: admin, member, viewer

---

### 7. Get IoT Metrics by Date Range

**GET** `/api/havenzhub/iotmetric/daterange?startDate={start}&endDate={end}`

**Roles**: admin, member, viewer

---

### 8. Get IoT Metric Alerts

**GET** `/api/havenzhub/iotmetric/alerts`

Get all IoT metrics with triggered alerts (critical for monitoring).

**Roles**: admin, member, viewer

---

### 9. Get IoT Metrics by Severity

**GET** `/api/havenzhub/iotmetric/severity/{severity}`

**Roles**: admin, member, viewer

**Path Parameters**:
- `severity`: 'info' | 'warning' | 'critical'

---

### 10. Delete IoT Metric

**DELETE** `/api/havenzhub/iotmetric/{id}`

Delete an IoT metric (for data cleanup).

**Roles**: admin only

**Success Response (204)**: No content

---

## DTOs and Models

### TypeScript Type Definitions

```typescript
// ============================================
// AUTH MODELS
// ============================================

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  companies: UserCompanyInfo[];
  expiresAt: string;
}

interface UserCompanyInfo {
  companyId: string;
  companyName: string;
  role: 'admin' | 'member' | 'viewer';
}

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  companyId?: string;
  role?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// ENTITY MODELS
// ============================================

interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'pending';
  locationAddress?: string;
  locationCity?: string;
  locationProvince?: string;
  locationCountry?: string;
  locationPostalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  annualRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  headName?: string;
  headEmail?: string;
  headPhone?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;  // 0-100
  startDate?: string;
  endDate?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  teamLead?: string;
  createdAt: string;
  updatedAt: string;
}

interface Property {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  type?: 'office' | 'warehouse' | 'datacenter' | 'residential' | 'industrial' | 'retail';
  status: 'active' | 'inactive' | 'under-construction' | 'maintenance';
  locationAddress?: string;
  locationCity?: string;
  locationProvince?: string;
  locationCountry?: string;
  locationPostalCode?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  sizeTotalArea?: number;
  sizeUsableArea?: number;
  sizeFloors?: number;
  currentValue?: number;
  monthlyOperatingCosts?: number;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  uploadedByUserId: string;
  companyId: string;
  name: string;
  fileType?: string;
  fileSizeBytes?: number;
  contentHash?: string;
  storagePath?: string;
  version: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  accessLevel: 'public' | 'private' | 'restricted';
  category?: 'contract' | 'financial' | 'technical' | 'legal' | 'hr' | 'marketing' | 'other';
  metadata?: string;  // JSON string
  tags?: string;      // JSON string
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface BmsDevice {
  id: string;
  companyId: string;
  propertyId: string;
  name: string;
  type: 'authenticator-phone' | 'authenticator-tablet' | 'access-control' | 'camera' | 'sensor' | 'controller';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress?: string;
  firmwareVersion?: string;
  capabilities?: string;  // JSON string
  locationZone?: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  batteryLevel?: number;
  signalStrength?: number;
  uptimePercentage?: number;
  lastHeartbeat?: string;
  installationDate?: string;
  warrantyExpiryDate?: string;
  maintenanceSchedule?: string;
  lastMaintenanceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface FacialRecognition {
  id: string;
  userId: string;
  companyId: string;
  faceEncoding: string;  // Base64 encoded
  encodingAlgorithm: 'facenet' | 'dlib' | 'deepface' | 'insightface';
  encodingVersion?: string;
  confidenceThreshold: number;
  qualityScore?: number;
  enrollmentPhotoUrl?: string;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  lastVerifiedAt?: string;
  verificationCount: number;
  failedAttempts: number;
  enrollmentDate: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessLog {
  id: number;
  userId?: string;
  companyId: string;
  propertyId: string;
  deviceId: string;
  accessType: 'entry' | 'exit' | 'denied' | 'tailgate' | 'forced';
  verificationMethod: 'facial-recognition' | 'rfid-card' | 'pin-code' | 'qr-code' | 'manual-override';
  confidenceScore?: number;
  accessGranted: boolean;
  denialReason?: string;
  anomalyDetected: boolean;
  anomalyType?: string;
  locationZone?: string;
  direction?: 'in' | 'out';
  verificationDurationMs?: number;
  photoCapturedUrl?: string;
  videoClipUrl?: string;
  temperatureReading?: number;
  timestamp: string;
  notes?: string;
}

interface IotMetric {
  id: number;
  deviceId: string;
  propertyId: string;
  companyId: string;
  metricType: string;
  value: number;
  unit?: string;
  alertTriggered: boolean;
  alertSeverity?: 'info' | 'warning' | 'critical';
  thresholdMin?: number;
  thresholdMax?: number;
  qualityIndicator?: 'excellent' | 'good' | 'fair' | 'poor';
  timestamp: string;
  notes?: string;
}

// ============================================
// REQUEST MODELS
// ============================================

interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  teamLead?: string;
}

interface UpdateProjectRequest {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  teamLead?: string;
}

interface RejectDocumentRequest {
  reason?: string;
}
```

---

## Error Handling

All endpoints may return the following error responses:

### 400 Bad Request
```typescript
{
  error: string;
  errors?: {
    [fieldName: string]: string[];
  }
}
```

**Example**:
```json
{
  "error": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "email": ["Invalid email format"]
  }
}
```

### 401 Unauthorized
```typescript
{
  error: 'Invalid token' | 'Invalid credentials' | 'Token expired'
}
```

### 403 Forbidden
```typescript
{
  error: 'Insufficient permissions' | 'Access denied' | 'Company mismatch'
}
```

### 404 Not Found
```typescript
{
  error: 'Resource not found'
}
```

### 409 Conflict
```typescript
{
  error: 'Resource already exists'
}
```

### 500 Internal Server Error
```typescript
{
  error: 'Internal server error'
}
```

---

## Best Practices

### 1. Authentication & Authorization

```typescript
// Store token and company info after login
const loginResponse = await login(email, password);
localStorage.setItem('token', loginResponse.token);
localStorage.setItem('companyId', loginResponse.companies[0].companyId);
localStorage.setItem('role', loginResponse.companies[0].role);

// Create authenticated API client
const apiClient = {
  get: (url: string) => fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Company-Id': localStorage.getItem('companyId')!,
      'Content-Type': 'application/json'
    }
  }),
  post: (url: string, body: any) => fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Company-Id': localStorage.getItem('companyId')!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }),
  // ... put, delete
};
```

### 2. Token Expiration Handling

```typescript
// Check token expiration
const expiresAt = new Date(loginResponse.expiresAt);
if (new Date() >= expiresAt) {
  // Token expired - redirect to login
  window.location.href = '/login';
}

// Auto-refresh before expiration
const refreshThreshold = 5 * 60 * 1000; // 5 minutes
if (expiresAt.getTime() - Date.now() < refreshThreshold) {
  // Prompt user to refresh or auto-refresh
}
```

### 3. Error Handling

```typescript
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### 4. Date Handling

```typescript
// All dates are ISO 8601 UTC strings
const project: Project = await getProject(id);

// Parse to local Date object
const startDate = new Date(project.startDate!);

// Format for display
const formatted = startDate.toLocaleDateString();

// Send to API (convert to ISO string)
const updateRequest: UpdateProjectRequest = {
  ...project,
  startDate: new Date().toISOString()
};
```

### 5. GUID Handling

```typescript
// All IDs are GUIDs (UUID v4) in string format
const userId: string = '75874acb-a00e-442c-854d-fd0350b2b299';

// No need to parse - use as strings
const user = await getUser(userId);
```

### 6. Pagination (Client-Side)

```typescript
// API doesn't support pagination yet - implement client-side
const allProjects = await getAllProjects();

// Client-side pagination
const pageSize = 20;
const page = 1;
const paginatedProjects = allProjects.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

### 7. Filtering

```typescript
// Use specific endpoints instead of client-side filtering
// ❌ Bad
const allProjects = await getAllProjects();
const activeProjects = allProjects.filter(p => p.status === 'active');

// ✅ Good
const activeProjects = await getProjectsByStatus('active');
```

### 8. Role-Based UI

```typescript
const currentRole = localStorage.getItem('role');

// Show/hide UI elements based on role
{currentRole === 'admin' && <DeleteButton />}
{['admin', 'member'].includes(currentRole!) && <EditButton />}
{<ViewButton />} // All roles can view
```

### 9. Company Context Switching

```typescript
// User can belong to multiple companies
const loginResponse = await login(email, password);

// Allow user to select company
const selectedCompany = loginResponse.companies[0];

// Update context
localStorage.setItem('companyId', selectedCompany.companyId);
localStorage.setItem('role', selectedCompany.role);

// Reload data for new company context
await refreshAllData();
```

### 10. Security Considerations

```typescript
// ❌ Never log sensitive data
console.log('Token:', token); // BAD

// ❌ Never expose in URL
fetch(`/api/users?token=${token}`); // BAD

// ✅ Always use headers
fetch('/api/users', {
  headers: { 'Authorization': `Bearer ${token}` }
}); // GOOD

// ❌ Never store passwords
localStorage.setItem('password', password); // BAD

// ✅ Only store tokens
localStorage.setItem('token', loginResponse.token); // GOOD
```

---

## Testing Credentials

For development and testing:

**Company**: Agritech Haven LP
**Company ID**: `0bc1cf05-e0d2-4b85-a4b9-bd3cc6d5197a`

| Role | Email | Password |
|------|-------|----------|
| **Admin** | sarah.johnson@agritech.com | Password123! |
| **Member** | lisa.martinez@agritech.com | Password123! |
| **Viewer** | amanda.garcia@agritech.com | Password123! |

---

## Support

For questions or issues:
- **Documentation**: `/docs`
- **API Health**: `GET /health/deep`
- **Swagger UI**: `/swagger` (development only)

---

**Last Updated**: 2025-10-31
**API Version**: 1.0.0
**Backend Framework**: ASP.NET Core 8.0
