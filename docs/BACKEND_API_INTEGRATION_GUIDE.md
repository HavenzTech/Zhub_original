# HAVENZ BMS - Backend API Integration Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Purpose:** Complete reference for integrating ASP.NET Core backend with Next.js frontend

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Configuration](#backend-configuration)
3. [Frontend Configuration](#frontend-configuration)
4. [API Controllers & Endpoints](#api-controllers--endpoints)
5. [Data Models & Entities](#data-models--entities)
6. [Integration Architecture](#integration-architecture)
7. [Integration Guide](#integration-guide)
8. [Code Examples](#code-examples)
9. [Quick Reference Tables](#quick-reference-tables)

---

## Project Overview

### Backend Stack
- **Framework:** ASP.NET Core 8.0
- **Database:** PostgreSQL (via Docker)
- **ORM:** Entity Framework Core
- **Authentication:** JWT Bearer Tokens
- **API Pattern:** RESTful
- **Route Pattern:** `api/havenzhub/[controller]`

### Frontend Stack
- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS 3.4.17
- **UI Library:** Radix UI + Custom Components
- **State Management:** React Hooks
- **Forms:** React Hook Form + Zod Validation
- **HTTP Client:** Native Fetch API

### Project Locations
- **Backend:** `C:\repositories\HavenzBMS`
- **Frontend:** `C:\repositories\HavenzBMS\Zhub_original`

---

## Backend Configuration

### Base URLs

**Development:**
```
HTTP:  http://localhost:5087
HTTPS: https://localhost:7177
```

**IIS Express:**
```
HTTP:  http://localhost:38515
HTTPS: https://localhost:44346
```

### Database Connection

```
Host: havenz_db
Port: 5432
Database: HavenzHub
Username: postgres
Password: HavenzDB2025!
```

**Connection String:**
```
Host=havenz_db;Port=5432;Database=HavenzHub;Username=postgres;Password=HavenzDB2025!
```

### JWT Authentication Settings

```json
{
  "SecretKey": "your-super-secret-jwt-key-change-this-in-production",
  "Issuer": "HavenzHub",
  "Audience": "HavenzHubAPI",
  "ExpiryMinutes": 60
}
```

### CORS Configuration

**Allowed Origins:**
- `http://localhost:3000` (React/Next.js default)
- `http://localhost:5173` (Vite default)

---

## Frontend Configuration

### Current Architecture

The frontend uses **Next.js API Routes** as a middleware layer:

```
Frontend Components → Next.js API Routes → External Services
```

**Existing API Routes:**
- `/api/chat` - Proxies to RAG backend (http://localhost:8002/chat)
- `/api/files` - Lists files from filesystem
- `/api/upload` - Handles file uploads
- `/api/download` - Serves file downloads
- `/api/preview` - Previews file content
- `/api/delete` - Deletes files/folders

### Required Configuration

**Create `.env.local` in frontend directory:**
```env
# Backend API Configuration
NEXT_PUBLIC_BMS_API_BASE_URL=http://localhost:5087
NEXT_PUBLIC_BMS_API_HTTPS_URL=https://localhost:7177

# API Route Prefix
NEXT_PUBLIC_API_PREFIX=/api/havenzhub

# JWT Settings (if stored client-side)
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## API Controllers & Endpoints

### 1. Health Controller

**Base Route:** `/health`

#### Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Basic health check | `{ status, timestamp, service, version }` |
| GET | `/health/deep` | Deep health check with DB | `{ status, timestamp, service, version, database }` |

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T10:00:00Z",
  "service": "Havenz Hub API",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "userCount": 15
  }
}
```

---

### 2. User Controller

**Base Route:** `api/havenzhub/user`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/user` | Create user | `User` | 201 + `User` |
| GET | `/api/havenzhub/user` | Get all users | - | 200 + `User[]` |
| GET | `/api/havenzhub/user/{id}` | Get user by ID | - | 200 + `User` |
| GET | `/api/havenzhub/user/email/{email}` | Get user by email | - | 200 + `User` |
| GET | `/api/havenzhub/user/company/{companyId}` | Get users by company | - | 200 + `User[]` |
| PUT | `/api/havenzhub/user/{id}` | Update user | `User` | 204 |
| DELETE | `/api/havenzhub/user/{id}` | Delete user | - | 204 |

#### User Model

```typescript
interface User {
  id: string;                    // Guid
  email: string;                 // max 255, required, unique
  name: string;                  // max 255, required
  pictureUrl?: string;           // max 500
  createdAt: string;             // ISO 8601 DateTime
  updatedAt: string;             // ISO 8601 DateTime
}
```

#### Example Request (Create User)

```json
POST /api/havenzhub/user
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "pictureUrl": "https://example.com/avatar.jpg"
}
```

#### Example Response

```json
HTTP/1.1 201 Created
Location: /api/havenzhub/user/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "pictureUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-10-27T10:00:00Z",
  "updatedAt": "2025-10-27T10:00:00Z"
}
```

---

### 3. Company Controller

**Base Route:** `api/havenzhub/company`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/company` | Create company | `Company` | 201 + `Company` |
| GET | `/api/havenzhub/company` | Get all companies | - | 200 + `Company[]` |
| GET | `/api/havenzhub/company/{id}` | Get company by ID | - | 200 + `Company` |
| GET | `/api/havenzhub/company/status/{status}` | Get by status | - | 200 + `Company[]` |
| GET | `/api/havenzhub/company/user/{userId}` | Get by user | - | 200 + `Company[]` |
| GET | `/api/havenzhub/company/industry/{industry}` | Get by industry | - | 200 + `Company[]` |
| PUT | `/api/havenzhub/company/{id}` | Update company | `Company` | 204 |
| DELETE | `/api/havenzhub/company/{id}` | Delete company | - | 204 |

#### Company Model

```typescript
interface Company {
  id: string;                           // Guid
  name: string;                         // max 255, required
  logoUrl?: string;                     // max 500
  industry?: string;                    // max 100
  status: string;                       // max 20, default: "active"
  locationAddress?: string;
  locationCity?: string;                // max 100
  locationProvince?: string;            // max 50
  locationCountry?: string;             // max 50
  locationPostalCode?: string;          // max 20
  contactEmail?: string;                // max 255
  contactPhone?: string;                // max 50
  annualRevenue?: number;               // decimal
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
}
```

#### Enums

**Company Status:**
- `active`
- `inactive`
- `pending`

---

### 4. Department Controller

**Base Route:** `api/havenzhub/department`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/department` | Create department | `Department` | 201 + `Department` |
| GET | `/api/havenzhub/department` | Get all departments | - | 200 + `Department[]` |
| GET | `/api/havenzhub/department/{id}` | Get by ID | - | 200 + `Department` |
| GET | `/api/havenzhub/department/company/{companyId}` | Get by company | - | 200 + `Department[]` |
| GET | `/api/havenzhub/department/search/{name}` | Search by name | - | 200 + `Department[]` |
| PUT | `/api/havenzhub/department/{id}` | Update department | `Department` | 204 |
| DELETE | `/api/havenzhub/department/{id}` | Delete department | - | 204 |

#### Department Model

```typescript
interface Department {
  id: string;                           // Guid
  companyId: string;                    // Guid, required, FK
  name: string;                         // max 255, required
  description?: string;
  headName?: string;                    // max 255
  headEmail?: string;                   // max 255
  headPhone?: string;                   // max 50
  budgetAllocated?: number;             // decimal
  budgetSpent?: number;                 // decimal
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
}
```

---

### 5. Project Controller

**Base Route:** `api/havenzhub/project`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/project` | Create project | `Project` | 201 + `Project` |
| GET | `/api/havenzhub/project` | Get all projects | - | 200 + `Project[]` |
| GET | `/api/havenzhub/project/{id}` | Get by ID | - | 200 + `Project` |
| GET | `/api/havenzhub/project/status/{status}` | Get by status | - | 200 + `Project[]` |
| GET | `/api/havenzhub/project/company/{companyId}` | Get by company | - | 200 + `Project[]` |
| GET | `/api/havenzhub/project/priority/{priority}` | Get by priority | - | 200 + `Project[]` |
| GET | `/api/havenzhub/project/daterange?startDate={start}&endDate={end}` | Get by date range | - | 200 + `Project[]` |
| PUT | `/api/havenzhub/project/{id}` | Update project | `Project` | 204 |
| DELETE | `/api/havenzhub/project/{id}` | Delete project | - | 204 |

#### Project Model

```typescript
interface Project {
  id: string;                           // Guid
  companyId: string;                    // Guid, required, FK
  name: string;                         // max 255, required
  description?: string;
  status: string;                       // max 50, default: "planning"
  priority: string;                     // max 20, default: "medium"
  progress: number;                     // 0-100
  startDate?: string;                   // ISO 8601 DateTime
  endDate?: string;                     // ISO 8601 DateTime
  budgetAllocated?: number;             // decimal
  budgetSpent?: number;                 // decimal
  teamLead?: string;                    // max 255
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
}
```

#### Enums

**Project Status:**
- `planning`
- `active`
- `on-hold`
- `completed`
- `cancelled`

**Project Priority:**
- `low`
- `medium`
- `high`
- `critical`

---

### 6. Property Controller

**Base Route:** `api/havenzhub/property`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/property` | Create property | `Property` | 201 + `Property` |
| GET | `/api/havenzhub/property` | Get all properties | - | 200 + `Property[]` |
| GET | `/api/havenzhub/property/{id}` | Get by ID | - | 200 + `Property` |
| GET | `/api/havenzhub/property/company/{companyId}` | Get by company | - | 200 + `Property[]` |
| GET | `/api/havenzhub/property/type/{type}` | Get by type | - | 200 + `Property[]` |
| GET | `/api/havenzhub/property/status/{status}` | Get by status | - | 200 + `Property[]` |
| GET | `/api/havenzhub/property/location?city={city}&province={province}&country={country}` | Get by location | - | 200 + `Property[]` |
| PUT | `/api/havenzhub/property/{id}` | Update property | `Property` | 204 |
| DELETE | `/api/havenzhub/property/{id}` | Delete property | - | 204 |

#### Property Model

```typescript
interface Property {
  id: string;                           // Guid
  companyId: string;                    // Guid, required, FK
  name: string;                         // max 255, required
  description?: string;
  type?: string;                        // max 50
  status: string;                       // max 50, default: "active"
  locationAddress?: string;
  locationCity?: string;                // max 100
  locationProvince?: string;            // max 50
  locationCountry?: string;             // max 50
  locationPostalCode?: string;          // max 20
  locationLatitude?: number;            // decimal
  locationLongitude?: number;           // decimal
  sizeTotalArea?: number;               // decimal
  sizeUsableArea?: number;              // decimal
  sizeFloors?: number;                  // int
  currentValue?: number;                // decimal
  monthlyOperatingCosts?: number;       // decimal
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
}
```

#### Enums

**Property Type:**
- `office`
- `warehouse`
- `datacenter`
- `residential`
- `industrial`
- `retail`

**Property Status:**
- `active`
- `inactive`
- `under-construction`
- `maintenance`

---

### 7. Document Controller

**Base Route:** `api/havenzhub/document`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/document` | Create document | `Document` | 201 + `Document` |
| GET | `/api/havenzhub/document` | Get all documents | - | 200 + `Document[]` |
| GET | `/api/havenzhub/document/{id}` | Get by ID | - | 200 + `Document` |
| GET | `/api/havenzhub/document/company/{companyId}` | Get by company | - | 200 + `Document[]` |
| GET | `/api/havenzhub/document/status/{status}` | Get by status | - | 200 + `Document[]` |
| GET | `/api/havenzhub/document/uploader/{uploadedByUserId}` | Get by uploader | - | 200 + `Document[]` |
| GET | `/api/havenzhub/document/category/{category}` | Get by category | - | 200 + `Document[]` |
| GET | `/api/havenzhub/document/accesslevel/{accessLevel}` | Get by access level | - | 200 + `Document[]` |
| GET | `/api/havenzhub/document/search/{name}` | Search by name | - | 200 + `Document[]` |
| PUT | `/api/havenzhub/document/{id}` | Update document | `Document` | 204 |
| DELETE | `/api/havenzhub/document/{id}` | Soft delete | - | 204 |
| DELETE | `/api/havenzhub/document/{id}/hard` | Hard delete | - | 204 |

#### Document Model

```typescript
interface Document {
  id: string;                           // Guid
  uploadedByUserId: string;             // Guid, required, FK
  companyId: string;                    // Guid, required, FK
  name: string;                         // max 500, required
  fileType?: string;                    // max 50 (pdf, docx, xlsx, etc.)
  fileSizeBytes?: number;               // long
  contentHash?: string;                 // max 64 (SHA-256)
  storagePath?: string;
  version: number;                      // default: 1
  status: string;                       // max 20, default: "draft"
  accessLevel: string;                  // max 20, default: "private"
  category?: string;                    // max 50
  metadata?: object;                    // JSONB
  tags?: string[];                      // JSONB
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
  deletedAt?: string;                   // ISO 8601 DateTime (soft delete)
}
```

#### Enums

**Document Status:**
- `draft`
- `pending`
- `approved`
- `rejected`

**Document Access Level:**
- `public`
- `private`
- `restricted`

**Document Category:**
- `contract`
- `financial`
- `technical`
- `legal`
- `hr`
- `marketing`
- `other`

---

### 8. BMS Device Controller

**Base Route:** `api/havenzhub/bmsdevice`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/bmsdevice` | Create device | `BmsDevice` | 201 + `BmsDevice` |
| GET | `/api/havenzhub/bmsdevice` | Get all devices | - | 200 + `BmsDevice[]` |
| GET | `/api/havenzhub/bmsdevice/{id}` | Get by ID | - | 200 + `BmsDevice` |
| GET | `/api/havenzhub/bmsdevice/property/{propertyId}` | Get by property | - | 200 + `BmsDevice[]` |
| GET | `/api/havenzhub/bmsdevice/type/{type}` | Get by type | - | 200 + `BmsDevice[]` |
| GET | `/api/havenzhub/bmsdevice/status/{status}` | Get by status | - | 200 + `BmsDevice[]` |
| GET | `/api/havenzhub/bmsdevice/company/{companyId}` | Get by company | - | 200 + `BmsDevice[]` |
| GET | `/api/havenzhub/bmsdevice/maintenance/required` | Get maintenance due | - | 200 + `BmsDevice[]` |
| PUT | `/api/havenzhub/bmsdevice/{id}` | Update device | `BmsDevice` | 204 |
| DELETE | `/api/havenzhub/bmsdevice/{id}` | Soft delete | - | 204 |

#### BmsDevice Model

```typescript
interface BmsDevice {
  id: string;                           // Guid
  companyId: string;                    // Guid, required, FK
  propertyId: string;                   // Guid, required, FK
  name: string;                         // max 255, required
  type: string;                         // max 50, required
  manufacturer?: string;                // max 100
  model?: string;                       // max 100
  serialNumber?: string;                // max 100
  macAddress?: string;                  // max 17
  ipAddress?: string;                   // max 45
  firmwareVersion?: string;             // max 50
  capabilities?: object;                // JSONB
  locationZone?: string;                // max 100
  status: string;                       // max 20, default: "online"
  batteryLevel?: number;                // decimal
  signalStrength?: number;              // decimal
  uptimePercentage?: number;            // decimal
  lastHeartbeat?: string;               // ISO 8601 DateTime
  installationDate?: string;            // ISO 8601 DateTime
  warrantyExpiryDate?: string;          // ISO 8601 DateTime
  maintenanceSchedule?: string;         // max 50
  lastMaintenanceDate?: string;         // ISO 8601 DateTime
  notes?: string;
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
  deletedAt?: string;                   // ISO 8601 DateTime (soft delete)
}
```

#### Enums

**BMS Device Type:**
- `authenticator-phone`
- `authenticator-tablet`
- `access-control`
- `camera`
- `sensor`
- `controller`

**BMS Device Status:**
- `online`
- `offline`
- `maintenance`
- `error`

---

### 9. Access Log Controller

**Base Route:** `api/havenzhub/accesslog`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/accesslog` | Create log | `AccessLog` | 201 + `AccessLog` |
| GET | `/api/havenzhub/accesslog` | Get all logs | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/{id}` | Get by ID | - | 200 + `AccessLog` |
| GET | `/api/havenzhub/accesslog/user/{userId}` | Get by user | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/property/{propertyId}` | Get by property | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/device/{deviceId}` | Get by device | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/company/{companyId}` | Get by company | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/type/{accessType}` | Get by type | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/daterange?startDate={start}&endDate={end}` | Get by date range | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/anomalous` | Get anomalous logs | - | 200 + `AccessLog[]` |
| GET | `/api/havenzhub/accesslog/denied` | Get denied access | - | 200 + `AccessLog[]` |
| PUT | `/api/havenzhub/accesslog/{id}` | Update log | `AccessLog` | 204 |
| DELETE | `/api/havenzhub/accesslog/{id}` | Delete log | - | 204 |

#### AccessLog Model

```typescript
interface AccessLog {
  id: number;                           // long
  userId?: string;                      // Guid, nullable, FK
  companyId: string;                    // Guid, required, FK
  propertyId: string;                   // Guid, required, FK
  deviceId: string;                     // Guid, required, FK
  accessType: string;                   // max 20, required
  verificationMethod: string;           // max 50, required
  confidenceScore?: number;             // decimal
  accessGranted: boolean;               // default: true
  denialReason?: string;                // max 255
  anomalyDetected: boolean;             // default: false
  anomalyType?: string;                 // max 100
  locationZone?: string;                // max 100
  direction?: string;                   // max 10
  verificationDurationMs?: number;      // int
  photoCapturedUrl?: string;            // max 500
  videoClipUrl?: string;                // max 500
  temperatureReading?: number;          // decimal
  timestamp: string;                    // ISO 8601 DateTime
  notes?: string;
}
```

#### Enums

**Access Type:**
- `entry`
- `exit`
- `denied`
- `tailgate`
- `forced`

**Verification Method:**
- `FacialRecognition`
- `RfidCard`
- `PinCode`
- `QrCode`
- `ManualOverride`

---

### 10. IoT Metric Controller

**Base Route:** `api/havenzhub/iotmetric`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/iotmetric` | Create metric | `IotMetric` | 201 + `IotMetric` |
| GET | `/api/havenzhub/iotmetric` | Get all metrics | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/{id}` | Get by ID | - | 200 + `IotMetric` |
| GET | `/api/havenzhub/iotmetric/device/{deviceId}` | Get by device | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/property/{propertyId}` | Get by property | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/company/{companyId}` | Get by company | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/type/{metricType}` | Get by type | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/daterange?startDate={start}&endDate={end}` | Get by date range | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/alerts` | Get alert metrics | - | 200 + `IotMetric[]` |
| GET | `/api/havenzhub/iotmetric/severity/{severity}` | Get by severity | - | 200 + `IotMetric[]` |
| PUT | `/api/havenzhub/iotmetric/{id}` | Update metric | `IotMetric` | 204 |
| DELETE | `/api/havenzhub/iotmetric/{id}` | Delete metric | - | 204 |

#### IotMetric Model

```typescript
interface IotMetric {
  id: number;                           // long
  deviceId: string;                     // Guid, required, FK
  propertyId: string;                   // Guid, required, FK
  companyId: string;                    // Guid, required, FK
  metricType: string;                   // max 50, required
  value: number;                        // decimal, required
  unit?: string;                        // max 20
  alertTriggered: boolean;              // default: false
  alertSeverity?: string;               // max 20 (info, warning, critical)
  thresholdMin?: number;                // decimal
  thresholdMax?: number;                // decimal
  qualityIndicator?: string;            // max 20
  timestamp: string;                    // ISO 8601 DateTime
  notes?: string;
}
```

#### Supported Metric Types

**Environmental:**
- `temperature`
- `humidity`
- `air_quality_co2`
- `air_quality_voc`
- `air_quality_pm25`
- `air_pressure`
- `noise_level`
- `light_level`

**Electrical:**
- `voltage_ac`
- `voltage_dc`
- `current`
- `power_consumption`
- `energy_usage`
- `power_factor`
- `frequency`

**Security & Occupancy:**
- `door_status`
- `window_status`
- `motion_detected`
- `occupancy_count`
- `camera_status`
- `alarm_status`

**Equipment Health:**
- `equipment_temp`
- `vibration_level`
- `water_detection`
- `airflow_rate`

**Resources:**
- `water_flow`
- `water_pressure`
- `gas_flow`
- `waste_level`

#### Enums

**Alert Severity:**
- `info`
- `warning`
- `critical`

**Quality Indicator:**
- `excellent`
- `good`
- `fair`
- `poor`

---

### 11. Facial Recognition Controller

**Base Route:** `api/havenzhub/facialrecognition`

#### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/havenzhub/facialrecognition` | Create record | `FacialRecognition` | 201 + `FacialRecognition` |
| GET | `/api/havenzhub/facialrecognition` | Get all records | - | 200 + `FacialRecognition[]` |
| GET | `/api/havenzhub/facialrecognition/{id}` | Get by ID | - | 200 + `FacialRecognition` |
| GET | `/api/havenzhub/facialrecognition/user/{userId}` | Get by user | - | 200 + `FacialRecognition` |
| GET | `/api/havenzhub/facialrecognition/company/{companyId}` | Get by company | - | 200 + `FacialRecognition[]` |
| GET | `/api/havenzhub/facialrecognition/status/{status}` | Get by status | - | 200 + `FacialRecognition[]` |
| GET | `/api/havenzhub/facialrecognition/expired` | Get expired | - | 200 + `FacialRecognition[]` |
| PUT | `/api/havenzhub/facialrecognition/{id}` | Update record | `FacialRecognition` | 204 |
| DELETE | `/api/havenzhub/facialrecognition/{id}` | Delete record | - | 204 |

#### FacialRecognition Model

```typescript
interface FacialRecognition {
  id: string;                           // Guid
  userId: string;                       // Guid, required, FK
  companyId: string;                    // Guid, required, FK
  faceEncoding: string;                 // Base64 encoded byte array
  encodingAlgorithm: string;            // max 50, default: "facenet"
  encodingVersion?: string;             // max 20
  confidenceThreshold: number;          // decimal, default: 0.80
  qualityScore?: number;                // decimal
  enrollmentPhotoUrl?: string;          // max 500
  status: string;                       // max 20, default: "active"
  lastVerifiedAt?: string;              // ISO 8601 DateTime
  verificationCount: number;            // default: 0
  failedAttempts: number;               // default: 0
  enrollmentDate?: string;              // ISO 8601 DateTime
  expiryDate?: string;                  // ISO 8601 DateTime
  notes?: string;
  createdAt: string;                    // ISO 8601 DateTime
  updatedAt: string;                    // ISO 8601 DateTime
}
```

#### Enums

**Facial Recognition Status:**
- `active`
- `inactive`
- `expired`
- `pending`

---

## Data Models & Entities

### Entity Relationship Diagram (ERD)

```
Company (Tenant Root)
├─ UserCompanies (M2M) ─ User
├─ Departments
│  ├─ ProjectDepartments (M2M) ─ Projects
│  ├─ PropertyDepartments (M2M) ─ Properties
│  └─ DocumentDepartments (M2M) ─ Documents
├─ Projects
│  ├─ ProjectDepartments (M2M) ─ Departments
│  ├─ PropertyProjects (M2M) ─ Properties
│  └─ DocumentProjects (M2M) ─ Documents
├─ Properties
│  ├─ PropertyDepartments (M2M) ─ Departments
│  ├─ PropertyProjects (M2M) ─ Projects
│  ├─ DocumentProperties (M2M) ─ Documents
│  ├─ BmsDevices
│  ├─ AccessLogs
│  └─ IotMetrics
├─ Documents
│  ├─ UploadedByUser (FK)
│  ├─ DocumentDepartments (M2M) ─ Departments
│  ├─ DocumentProjects (M2M) ─ Projects
│  ├─ DocumentProperties (M2M) ─ Properties
│  └─ DocumentAuditTrails
├─ BmsDevices
│  ├─ Property (FK)
│  ├─ AccessLogs
│  └─ IotMetrics
├─ FacialRecognitions
│  └─ User (FK)
├─ AccessLogs
│  ├─ User (nullable FK)
│  ├─ Property (FK)
│  └─ BmsDevice (FK)
└─ IotMetrics
   ├─ Device (FK)
   └─ Property (FK)
```

### Junction Tables (Many-to-Many)

| Table Name | Left Entity | Right Entity | Additional Columns |
|------------|-------------|--------------|-------------------|
| `user_companies` | User | Company | `role`, `created_at`, `updated_at` |
| `project_departments` | Project | Department | `created_at` |
| `property_projects` | Property | Project | `created_at` |
| `property_departments` | Property | Department | `created_at` |
| `document_projects` | Document | Project | `created_at` |
| `document_properties` | Document | Property | `created_at` |
| `document_departments` | Document | Department | `created_at` |

### Multi-Tenancy Architecture

**Tenant Isolation:**
- All entities include `companyId` for tenant boundaries
- Data access filtered at database level using `companyId`
- User access controlled via `user_companies` with role-based permissions

**User Company Roles:**
- `Admin` - Full access to company data
- `Member` - Standard access with limited permissions
- `Viewer` - Read-only access

---

## Integration Architecture

### Recommended Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)              │
│  ┌──────────────────────────────────────────────┐  │
│  │  React Components (Client-Side)              │  │
│  │  - Pages, Forms, Tables, Charts              │  │
│  └───────────────────┬──────────────────────────┘  │
│                      │                              │
│  ┌───────────────────▼──────────────────────────┐  │
│  │  API Service Layer (New)                     │  │
│  │  - bmsApiService.ts                          │  │
│  │  - Error handling, types, interceptors       │  │
│  └───────────────────┬──────────────────────────┘  │
│                      │                              │
│  ┌───────────────────▼──────────────────────────┐  │
│  │  Next.js API Routes (Middleware Layer)       │  │
│  │  - /api/bms/[...path]                        │  │
│  │  - JWT validation, CORS, request proxying    │  │
│  └───────────────────┬──────────────────────────┘  │
└────────────────────┬─┴──────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼───────────────────────────────┐
│  ASP.NET Core Backend (Port 5087/7177)            │
│  ┌──────────────────────────────────────────────┐ │
│  │  Controllers                                 │ │
│  │  - User, Company, Project, Property, etc.    │ │
│  └───────────────────┬──────────────────────────┘ │
│                      │                             │
│  ┌───────────────────▼──────────────────────────┐ │
│  │  Business Logic                              │ │
│  │  - Services, Validators                      │ │
│  └───────────────────┬──────────────────────────┘ │
│                      │                             │
│  ┌───────────────────▼──────────────────────────┐ │
│  │  Data Access Layer (EF Core)                 │ │
│  └───────────────────┬──────────────────────────┘ │
└────────────────────┬─┴────────────────────────────┘
                     │
                     │ PostgreSQL Protocol
                     │
┌────────────────────▼───────────────────────────────┐
│  PostgreSQL Database (Port 5432)                   │
│  - havenz_db container                             │
└────────────────────────────────────────────────────┘
```

### Benefits of This Architecture

1. **Security**: Backend credentials never exposed to client
2. **CORS Management**: Simplified CORS handling via Next.js proxy
3. **Request Transformation**: Modify requests/responses in middleware
4. **Error Handling**: Centralized error handling at proxy layer
5. **Caching**: Implement caching strategies in Next.js routes
6. **Rate Limiting**: Add rate limiting at proxy layer
7. **Logging**: Centralized logging of API calls

---

## Integration Guide

### Step 1: Setup Environment Variables

Create `.env.local` in frontend root (`Zhub_original/`):

```env
# Backend API Configuration
NEXT_PUBLIC_BMS_API_BASE_URL=http://localhost:5087
BMS_API_BASE_URL=http://localhost:5087

# JWT Configuration
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Settings
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
```

### Step 2: Create TypeScript Types

Create `Zhub_original/types/bms.ts`:

```typescript
// Core Entity Types
export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  status: CompanyStatus;
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

export interface Department {
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

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate?: string;
  endDate?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  teamLead?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  type?: PropertyType;
  status: PropertyStatus;
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

export interface Document {
  id: string;
  uploadedByUserId: string;
  companyId: string;
  name: string;
  fileType?: string;
  fileSizeBytes?: number;
  contentHash?: string;
  storagePath?: string;
  version: number;
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  category?: DocumentCategory;
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface BmsDevice {
  id: string;
  companyId: string;
  propertyId: string;
  name: string;
  type: BmsDeviceType;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress?: string;
  firmwareVersion?: string;
  capabilities?: Record<string, any>;
  locationZone?: string;
  status: BmsDeviceStatus;
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

export interface AccessLog {
  id: number;
  userId?: string;
  companyId: string;
  propertyId: string;
  deviceId: string;
  accessType: AccessType;
  verificationMethod: VerificationMethod;
  confidenceScore?: number;
  accessGranted: boolean;
  denialReason?: string;
  anomalyDetected: boolean;
  anomalyType?: string;
  locationZone?: string;
  direction?: string;
  verificationDurationMs?: number;
  photoCapturedUrl?: string;
  videoClipUrl?: string;
  temperatureReading?: number;
  timestamp: string;
  notes?: string;
}

export interface IotMetric {
  id: number;
  deviceId: string;
  propertyId: string;
  companyId: string;
  metricType: string;
  value: number;
  unit?: string;
  alertTriggered: boolean;
  alertSeverity?: AlertSeverity;
  thresholdMin?: number;
  thresholdMax?: number;
  qualityIndicator?: QualityIndicator;
  timestamp: string;
  notes?: string;
}

export interface FacialRecognition {
  id: string;
  userId: string;
  companyId: string;
  faceEncoding: string;
  encodingAlgorithm: string;
  encodingVersion?: string;
  confidenceThreshold: number;
  qualityScore?: number;
  enrollmentPhotoUrl?: string;
  status: FacialRecognitionStatus;
  lastVerifiedAt?: string;
  verificationCount: number;
  failedAttempts: number;
  enrollmentDate?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export type CompanyStatus = 'active' | 'inactive' | 'pending';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type PropertyType = 'office' | 'warehouse' | 'datacenter' | 'residential' | 'industrial' | 'retail';
export type PropertyStatus = 'active' | 'inactive' | 'under-construction' | 'maintenance';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type DocumentAccessLevel = 'public' | 'private' | 'restricted';
export type DocumentCategory = 'contract' | 'financial' | 'technical' | 'legal' | 'hr' | 'marketing' | 'other';
export type BmsDeviceType = 'authenticator-phone' | 'authenticator-tablet' | 'access-control' | 'camera' | 'sensor' | 'controller';
export type BmsDeviceStatus = 'online' | 'offline' | 'maintenance' | 'error';
export type AccessType = 'entry' | 'exit' | 'denied' | 'tailgate' | 'forced';
export type VerificationMethod = 'FacialRecognition' | 'RfidCard' | 'PinCode' | 'QrCode' | 'ManualOverride';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type QualityIndicator = 'excellent' | 'good' | 'fair' | 'poor';
export type FacialRecognitionStatus = 'active' | 'inactive' | 'expired' | 'pending';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### Step 3: Create API Service Layer

Create `Zhub_original/lib/services/bmsApi.ts`:

```typescript
import { ApiResponse, ApiError } from '@/types/bms';

const BASE_URL = process.env.NEXT_PUBLIC_BMS_API_BASE_URL || 'http://localhost:5087';
const API_PREFIX = '/api/havenzhub';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

class BmsApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'BmsApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

class BmsApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = TIMEOUT, skipAuth = false, ...fetchOptions } = options;

    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json() : { message: response.statusText };
        throw new BmsApiError(
          errorData.message || 'API request failed',
          response.status,
          errorData.code,
          errorData.details
        );
      }

      return isJson ? await response.json() : (response as any);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BmsApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new BmsApiError('Request timeout', 408);
        }
        throw new BmsApiError(error.message, 500);
      }

      throw new BmsApiError('Unknown error occurred', 500);
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Health endpoints
  health = {
    check: () => this.get<{ status: string; timestamp: string; service: string; version: string }>('/health', { skipAuth: true }),
    deepCheck: () => this.get<{ status: string; timestamp: string; service: string; version: string; database: any }>('/health/deep', { skipAuth: true }),
  };

  // User endpoints
  users = {
    getAll: () => this.get('/user'),
    getById: (id: string) => this.get(`/user/${id}`),
    getByEmail: (email: string) => this.get(`/user/email/${encodeURIComponent(email)}`),
    getByCompany: (companyId: string) => this.get(`/user/company/${companyId}`),
    create: (data: any) => this.post('/user', data),
    update: (id: string, data: any) => this.put(`/user/${id}`, data),
    delete: (id: string) => this.delete(`/user/${id}`),
  };

  // Company endpoints
  companies = {
    getAll: () => this.get('/company'),
    getById: (id: string) => this.get(`/company/${id}`),
    getByStatus: (status: string) => this.get(`/company/status/${status}`),
    getByUser: (userId: string) => this.get(`/company/user/${userId}`),
    getByIndustry: (industry: string) => this.get(`/company/industry/${encodeURIComponent(industry)}`),
    create: (data: any) => this.post('/company', data),
    update: (id: string, data: any) => this.put(`/company/${id}`, data),
    delete: (id: string) => this.delete(`/company/${id}`),
  };

  // Department endpoints
  departments = {
    getAll: () => this.get('/department'),
    getById: (id: string) => this.get(`/department/${id}`),
    getByCompany: (companyId: string) => this.get(`/department/company/${companyId}`),
    search: (name: string) => this.get(`/department/search/${encodeURIComponent(name)}`),
    create: (data: any) => this.post('/department', data),
    update: (id: string, data: any) => this.put(`/department/${id}`, data),
    delete: (id: string) => this.delete(`/department/${id}`),
  };

  // Project endpoints
  projects = {
    getAll: () => this.get('/project'),
    getById: (id: string) => this.get(`/project/${id}`),
    getByStatus: (status: string) => this.get(`/project/status/${status}`),
    getByCompany: (companyId: string) => this.get(`/project/company/${companyId}`),
    getByPriority: (priority: string) => this.get(`/project/priority/${priority}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/project/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    create: (data: any) => this.post('/project', data),
    update: (id: string, data: any) => this.put(`/project/${id}`, data),
    delete: (id: string) => this.delete(`/project/${id}`),
  };

  // Property endpoints
  properties = {
    getAll: () => this.get('/property'),
    getById: (id: string) => this.get(`/property/${id}`),
    getByCompany: (companyId: string) => this.get(`/property/company/${companyId}`),
    getByType: (type: string) => this.get(`/property/type/${type}`),
    getByStatus: (status: string) => this.get(`/property/status/${status}`),
    getByLocation: (params: { city?: string; province?: string; country?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.get(`/property/location?${query}`);
    },
    create: (data: any) => this.post('/property', data),
    update: (id: string, data: any) => this.put(`/property/${id}`, data),
    delete: (id: string) => this.delete(`/property/${id}`),
  };

  // Document endpoints
  documents = {
    getAll: () => this.get('/document'),
    getById: (id: string) => this.get(`/document/${id}`),
    getByCompany: (companyId: string) => this.get(`/document/company/${companyId}`),
    getByStatus: (status: string) => this.get(`/document/status/${status}`),
    getByUploader: (uploadedByUserId: string) => this.get(`/document/uploader/${uploadedByUserId}`),
    getByCategory: (category: string) => this.get(`/document/category/${category}`),
    getByAccessLevel: (accessLevel: string) => this.get(`/document/accesslevel/${accessLevel}`),
    search: (name: string) => this.get(`/document/search/${encodeURIComponent(name)}`),
    create: (data: any) => this.post('/document', data),
    update: (id: string, data: any) => this.put(`/document/${id}`, data),
    softDelete: (id: string) => this.delete(`/document/${id}`),
    hardDelete: (id: string) => this.delete(`/document/${id}/hard`),
  };

  // BMS Device endpoints
  bmsDevices = {
    getAll: () => this.get('/bmsdevice'),
    getById: (id: string) => this.get(`/bmsdevice/${id}`),
    getByProperty: (propertyId: string) => this.get(`/bmsdevice/property/${propertyId}`),
    getByType: (type: string) => this.get(`/bmsdevice/type/${type}`),
    getByStatus: (status: string) => this.get(`/bmsdevice/status/${status}`),
    getByCompany: (companyId: string) => this.get(`/bmsdevice/company/${companyId}`),
    getMaintenanceRequired: () => this.get('/bmsdevice/maintenance/required'),
    create: (data: any) => this.post('/bmsdevice', data),
    update: (id: string, data: any) => this.put(`/bmsdevice/${id}`, data),
    delete: (id: string) => this.delete(`/bmsdevice/${id}`),
  };

  // Access Log endpoints
  accessLogs = {
    getAll: () => this.get('/accesslog'),
    getById: (id: number) => this.get(`/accesslog/${id}`),
    getByUser: (userId: string) => this.get(`/accesslog/user/${userId}`),
    getByProperty: (propertyId: string) => this.get(`/accesslog/property/${propertyId}`),
    getByDevice: (deviceId: string) => this.get(`/accesslog/device/${deviceId}`),
    getByCompany: (companyId: string) => this.get(`/accesslog/company/${companyId}`),
    getByType: (accessType: string) => this.get(`/accesslog/type/${accessType}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/accesslog/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    getAnomalous: () => this.get('/accesslog/anomalous'),
    getDenied: () => this.get('/accesslog/denied'),
    create: (data: any) => this.post('/accesslog', data),
    update: (id: number, data: any) => this.put(`/accesslog/${id}`, data),
    delete: (id: number) => this.delete(`/accesslog/${id}`),
  };

  // IoT Metric endpoints
  iotMetrics = {
    getAll: () => this.get('/iotmetric'),
    getById: (id: number) => this.get(`/iotmetric/${id}`),
    getByDevice: (deviceId: string) => this.get(`/iotmetric/device/${deviceId}`),
    getByProperty: (propertyId: string) => this.get(`/iotmetric/property/${propertyId}`),
    getByCompany: (companyId: string) => this.get(`/iotmetric/company/${companyId}`),
    getByType: (metricType: string) => this.get(`/iotmetric/type/${metricType}`),
    getByDateRange: (startDate: string, endDate: string) =>
      this.get(`/iotmetric/daterange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
    getAlerts: () => this.get('/iotmetric/alerts'),
    getBySeverity: (severity: string) => this.get(`/iotmetric/severity/${severity}`),
    create: (data: any) => this.post('/iotmetric', data),
    update: (id: number, data: any) => this.put(`/iotmetric/${id}`, data),
    delete: (id: number) => this.delete(`/iotmetric/${id}`),
  };

  // Facial Recognition endpoints
  facialRecognition = {
    getAll: () => this.get('/facialrecognition'),
    getById: (id: string) => this.get(`/facialrecognition/${id}`),
    getByUser: (userId: string) => this.get(`/facialrecognition/user/${userId}`),
    getByCompany: (companyId: string) => this.get(`/facialrecognition/company/${companyId}`),
    getByStatus: (status: string) => this.get(`/facialrecognition/status/${status}`),
    getExpired: () => this.get('/facialrecognition/expired'),
    create: (data: any) => this.post('/facialrecognition', data),
    update: (id: string, data: any) => this.put(`/facialrecognition/${id}`, data),
    delete: (id: string) => this.delete(`/facialrecognition/${id}`),
  };
}

// Export singleton instance
export const bmsApi = new BmsApiService();
export { BmsApiError };
```

### Step 4: Create Next.js API Proxy Route (Optional but Recommended)

Create `Zhub_original/app/api/bms/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BMS_API_BASE = process.env.BMS_API_BASE_URL || 'http://localhost:5087';
const API_PREFIX = '/api/havenzhub';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';

  const url = `${BMS_API_BASE}${API_PREFIX}/${path}${queryString}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    const response = await fetch(url, options);

    // Handle 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': contentType || 'text/plain' }
    });

  } catch (error) {
    console.error('BMS API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to BMS API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Step 5: Usage Examples in React Components

Create `Zhub_original/app/companies/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { bmsApi, BmsApiError } from '@/lib/services/bmsApi';
import { Company } from '@/types/bms';
import { toast } from 'sonner';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bmsApi.companies.getAll();
      setCompanies(data as Company[]);
      toast.success('Companies loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load companies';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (companyData: Partial<Company>) => {
    try {
      const newCompany = await bmsApi.companies.create(companyData);
      setCompanies(prev => [...prev, newCompany as Company]);
      toast.success('Company created successfully');
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to create company';
      toast.error(errorMessage);
      console.error('Error creating company:', err);
    }
  };

  const handleUpdateCompany = async (id: string, companyData: Partial<Company>) => {
    try {
      await bmsApi.companies.update(id, companyData);
      setCompanies(prev =>
        prev.map(c => (c.id === id ? { ...c, ...companyData } : c))
      );
      toast.success('Company updated successfully');
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to update company';
      toast.error(errorMessage);
      console.error('Error updating company:', err);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      await bmsApi.companies.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success('Company deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to delete company';
      toast.error(errorMessage);
      console.error('Error deleting company:', err);
    }
  };

  if (loading) {
    return <div>Loading companies...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={loadCompanies}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Companies</h1>
      <button onClick={() => handleCreateCompany({ name: 'New Company' })}>
        Add Company
      </button>
      <ul>
        {companies.map(company => (
          <li key={company.id}>
            <h3>{company.name}</h3>
            <p>Status: {company.status}</p>
            <p>Industry: {company.industry}</p>
            <button onClick={() => handleUpdateCompany(company.id, { status: 'inactive' })}>
              Deactivate
            </button>
            <button onClick={() => handleDeleteCompany(company.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 6: Error Handling Pattern

Create `Zhub_original/lib/errorHandler.ts`:

```typescript
import { BmsApiError } from './services/bmsApi';
import { toast } from 'sonner';

export function handleApiError(error: unknown, context?: string) {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  if (error instanceof BmsApiError) {
    const message = context
      ? `${context}: ${error.message}`
      : error.message;

    switch (error.status) {
      case 400:
        toast.error(`Validation Error: ${message}`);
        break;
      case 401:
        toast.error('Unauthorized. Please log in again.');
        // Redirect to login
        break;
      case 403:
        toast.error('Access denied. You do not have permission.');
        break;
      case 404:
        toast.error(`Not found: ${message}`);
        break;
      case 409:
        toast.error(`Conflict: ${message}`);
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(message);
    }

    return {
      message: error.message,
      status: error.status,
      code: error.code,
    };
  }

  toast.error('An unexpected error occurred');
  return {
    message: 'Unknown error',
    status: 500,
  };
}
```

---

## Code Examples

### Example 1: Fetching Companies with Status Filter

```typescript
import { bmsApi } from '@/lib/services/bmsApi';
import { Company, CompanyStatus } from '@/types/bms';

async function getActiveCompanies(): Promise<Company[]> {
  try {
    const companies = await bmsApi.companies.getByStatus('active');
    return companies as Company[];
  } catch (error) {
    console.error('Failed to fetch active companies:', error);
    throw error;
  }
}
```

### Example 2: Creating a New Project with Error Handling

```typescript
import { bmsApi, BmsApiError } from '@/lib/services/bmsApi';
import { Project } from '@/types/bms';
import { toast } from 'sonner';

async function createProject(projectData: Partial<Project>): Promise<Project | null> {
  try {
    const newProject = await bmsApi.projects.create(projectData);
    toast.success('Project created successfully!');
    return newProject as Project;
  } catch (error) {
    if (error instanceof BmsApiError) {
      if (error.status === 400) {
        toast.error(`Validation failed: ${error.message}`);
      } else if (error.status === 409) {
        toast.error('Project with this name already exists');
      } else {
        toast.error('Failed to create project');
      }
    }
    return null;
  }
}
```

### Example 3: Fetching IoT Metrics with Date Range

```typescript
import { bmsApi } from '@/lib/services/bmsApi';
import { IotMetric } from '@/types/bms';

async function getMetricsForLastWeek(deviceId: string): Promise<IotMetric[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  try {
    const metrics = await bmsApi.iotMetrics.getByDateRange(
      startDate.toISOString(),
      endDate.toISOString()
    );

    // Filter by device on client side if needed
    const deviceMetrics = (metrics as IotMetric[]).filter(
      m => m.deviceId === deviceId
    );

    return deviceMetrics;
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    throw error;
  }
}
```

### Example 4: Updating a Department with Optimistic UI

```typescript
import { useState } from 'react';
import { bmsApi } from '@/lib/services/bmsApi';
import { Department } from '@/types/bms';
import { toast } from 'sonner';

function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    // Optimistic update
    setDepartments(prev =>
      prev.map(dept => dept.id === id ? { ...dept, ...updates } : dept)
    );

    try {
      await bmsApi.departments.update(id, updates);
      toast.success('Department updated');
    } catch (error) {
      // Revert on error
      toast.error('Update failed, reverting changes');
      // Reload departments from server
      const freshDepartments = await bmsApi.departments.getAll();
      setDepartments(freshDepartments as Department[]);
    }
  };

  return { departments, updateDepartment };
}
```

### Example 5: Searching Documents

```typescript
import { bmsApi } from '@/lib/services/bmsApi';
import { Document } from '@/types/bms';

async function searchDocuments(query: string): Promise<Document[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const results = await bmsApi.documents.search(query);
    return results as Document[];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
```

### Example 6: Real-time Access Log Monitoring

```typescript
import { useState, useEffect } from 'react';
import { bmsApi } from '@/lib/services/bmsApi';
import { AccessLog } from '@/types/bms';

function useAccessLogMonitoring(propertyId: string, pollInterval = 5000) {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [anomalousLogs, setAnomalousLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [allLogs, anomalous] = await Promise.all([
          bmsApi.accessLogs.getByProperty(propertyId),
          bmsApi.accessLogs.getAnomalous(),
        ]);

        setLogs(allLogs as AccessLog[]);
        setAnomalousLogs(
          (anomalous as AccessLog[]).filter(log => log.propertyId === propertyId)
        );
      } catch (error) {
        console.error('Failed to fetch access logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, pollInterval);

    return () => clearInterval(interval);
  }, [propertyId, pollInterval]);

  return { logs, anomalousLogs };
}
```

---

## Quick Reference Tables

### Endpoint Summary Table

| Entity | GET All | GET By ID | GET Filtered | POST | PUT | DELETE |
|--------|---------|-----------|--------------|------|-----|--------|
| User | `/user` | `/user/{id}` | `/user/email/{email}`<br>`/user/company/{companyId}` | `/user` | `/user/{id}` | `/user/{id}` |
| Company | `/company` | `/company/{id}` | `/company/status/{status}`<br>`/company/user/{userId}`<br>`/company/industry/{industry}` | `/company` | `/company/{id}` | `/company/{id}` |
| Department | `/department` | `/department/{id}` | `/department/company/{companyId}`<br>`/department/search/{name}` | `/department` | `/department/{id}` | `/department/{id}` |
| Project | `/project` | `/project/{id}` | `/project/status/{status}`<br>`/project/company/{companyId}`<br>`/project/priority/{priority}`<br>`/project/daterange` | `/project` | `/project/{id}` | `/project/{id}` |
| Property | `/property` | `/property/{id}` | `/property/company/{companyId}`<br>`/property/type/{type}`<br>`/property/status/{status}`<br>`/property/location` | `/property` | `/property/{id}` | `/property/{id}` |
| Document | `/document` | `/document/{id}` | `/document/company/{companyId}`<br>`/document/status/{status}`<br>`/document/category/{category}`<br>`/document/search/{name}` | `/document` | `/document/{id}` | `/document/{id}` (soft)<br>`/document/{id}/hard` |
| BmsDevice | `/bmsdevice` | `/bmsdevice/{id}` | `/bmsdevice/property/{propertyId}`<br>`/bmsdevice/type/{type}`<br>`/bmsdevice/status/{status}`<br>`/bmsdevice/maintenance/required` | `/bmsdevice` | `/bmsdevice/{id}` | `/bmsdevice/{id}` (soft) |
| AccessLog | `/accesslog` | `/accesslog/{id}` | `/accesslog/user/{userId}`<br>`/accesslog/property/{propertyId}`<br>`/accesslog/device/{deviceId}`<br>`/accesslog/type/{accessType}`<br>`/accesslog/daterange`<br>`/accesslog/anomalous`<br>`/accesslog/denied` | `/accesslog` | `/accesslog/{id}` | `/accesslog/{id}` |
| IotMetric | `/iotmetric` | `/iotmetric/{id}` | `/iotmetric/device/{deviceId}`<br>`/iotmetric/property/{propertyId}`<br>`/iotmetric/type/{metricType}`<br>`/iotmetric/daterange`<br>`/iotmetric/alerts`<br>`/iotmetric/severity/{severity}` | `/iotmetric` | `/iotmetric/{id}` | `/iotmetric/{id}` |
| FacialRecognition | `/facialrecognition` | `/facialrecognition/{id}` | `/facialrecognition/user/{userId}`<br>`/facialrecognition/company/{companyId}`<br>`/facialrecognition/status/{status}`<br>`/facialrecognition/expired` | `/facialrecognition` | `/facialrecognition/{id}` | `/facialrecognition/{id}` |

### Status Code Reference

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request, resource created |
| 204 | No Content | Successful PUT/DELETE request |
| 400 | Bad Request | Invalid input (null models, validation errors) |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Database connection failed |

### Common Enum Values

| Type | Values |
|------|--------|
| CompanyStatus | `active`, `inactive`, `pending` |
| ProjectStatus | `planning`, `active`, `on-hold`, `completed`, `cancelled` |
| ProjectPriority | `low`, `medium`, `high`, `critical` |
| PropertyType | `office`, `warehouse`, `datacenter`, `residential`, `industrial`, `retail` |
| PropertyStatus | `active`, `inactive`, `under-construction`, `maintenance` |
| DocumentStatus | `draft`, `pending`, `approved`, `rejected` |
| DocumentAccessLevel | `public`, `private`, `restricted` |
| DocumentCategory | `contract`, `financial`, `technical`, `legal`, `hr`, `marketing`, `other` |
| BmsDeviceType | `authenticator-phone`, `authenticator-tablet`, `access-control`, `camera`, `sensor`, `controller` |
| BmsDeviceStatus | `online`, `offline`, `maintenance`, `error` |
| AccessType | `entry`, `exit`, `denied`, `tailgate`, `forced` |
| VerificationMethod | `FacialRecognition`, `RfidCard`, `PinCode`, `QrCode`, `ManualOverride` |
| AlertSeverity | `info`, `warning`, `critical` |
| FacialRecognitionStatus | `active`, `inactive`, `expired`, `pending` |

---

## Testing the Integration

### Step 1: Test Backend Health

```bash
# Basic health check
curl http://localhost:5087/health

# Deep health check
curl http://localhost:5087/health/deep
```

### Step 2: Test User Endpoints

```bash
# Create a user
curl -X POST http://localhost:5087/api/havenzhub/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'

# Get all users
curl http://localhost:5087/api/havenzhub/user
```

### Step 3: Test Company Endpoints

```bash
# Create a company
curl -X POST http://localhost:5087/api/havenzhub/company \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "industry": "Technology",
    "status": "active"
  }'

# Get all companies
curl http://localhost:5087/api/havenzhub/company

# Get companies by status
curl http://localhost:5087/api/havenzhub/company/status/active
```

### Step 4: Test Frontend Integration

Run the frontend:
```bash
cd Zhub_original
npm run dev
```

Test the API service in browser console:
```javascript
// Open browser console on http://localhost:3000
import { bmsApi } from './lib/services/bmsApi';

// Test health check
const health = await bmsApi.health.check();
console.log(health);

// Test fetching companies
const companies = await bmsApi.companies.getAll();
console.log(companies);
```

---

## Troubleshooting

### Issue: CORS Error

**Symptom:** Browser shows CORS policy error

**Solution:**
1. Ensure backend CORS settings include your frontend URL
2. Check `appsettings.json` in backend for CORS configuration
3. Verify frontend is running on allowed origin (localhost:3000 or localhost:5173)

### Issue: Connection Refused

**Symptom:** `fetch failed` or `connection refused`

**Solution:**
1. Verify backend is running: `curl http://localhost:5087/health`
2. Check backend port in `.env.local` matches actual port
3. Ensure database container is running: `docker ps`

### Issue: 401 Unauthorized

**Symptom:** API returns 401 status code

**Solution:**
1. Check if JWT token is properly set: `bmsApi.setToken(token)`
2. Verify token hasn't expired (60 minute expiry)
3. Use `skipAuth: true` option for public endpoints

### Issue: 404 Not Found

**Symptom:** Endpoint returns 404

**Solution:**
1. Verify endpoint URL matches documentation
2. Check route prefix is `/api/havenzhub` not `/api`
3. Ensure controller is registered in backend

### Issue: Type Errors

**Symptom:** TypeScript compilation errors

**Solution:**
1. Ensure all types are imported from `@/types/bms`
2. Use type assertions when necessary: `data as Company[]`
3. Check nullable fields are handled with optional chaining

---

## Next Steps

1. **Authentication Implementation:**
   - Implement JWT token generation on backend
   - Create login/signup pages
   - Store token in localStorage or cookie
   - Add token to API requests

2. **State Management:**
   - Consider adding Zustand or React Query for state management
   - Implement caching for frequently accessed data
   - Add optimistic updates for better UX

3. **Error Boundaries:**
   - Create error boundary components
   - Implement global error handling
   - Add retry logic for failed requests

4. **Real-time Features:**
   - Implement WebSocket for real-time updates
   - Add SignalR for access logs and IoT metrics
   - Create notification system for alerts

5. **Performance Optimization:**
   - Implement pagination for large lists
   - Add infinite scroll or load more functionality
   - Optimize bundle size with code splitting

6. **Testing:**
   - Write unit tests for API service
   - Add integration tests for components
   - Implement E2E tests with Playwright

---

## Additional Resources

- **Backend Repository:** `C:\repositories\HavenzBMS`
- **Frontend Repository:** `C:\repositories\HavenzBMS\Zhub_original`
- **Database Documentation:** `DATABASE_OVERVIEW.md`
- **Schema Design:** `SCHEMA_DESIGN_RATIONALE.md`
- **ERD Diagram:** `ERD_DIAGRAM.md`

---

**End of Documentation**


## SCHEMA:
Database Schema Organization
1. business schema
Contains core business entities like:
Companies
Departments
Projects
Properties
2. documents schema
Contains document management tables:
Documents
Document audit trails
Document relationships (junction tables)
3. identity schema
Contains user authentication/identity tables:
Users
User roles
User-company relationships (user_companies junction table)
4. iot schema
Contains IoT and hardware monitoring tables:
BMS Devices
Access Logs
IoT Metrics
Facial Recognition
5. public schema