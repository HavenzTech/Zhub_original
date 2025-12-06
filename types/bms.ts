// types/bms.ts - Backend-aligned Data Models for Havenz BMS
// Auto-synced with backend Swagger spec

// ============================================
// Core Entity Types (matching backend DTOs)
// ============================================

export interface User {
  id?: string;
  email: string;
  name: string;
  pictureUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface UserResponse {
  id?: string;
  email?: string | null;
  name?: string | null;
  pictureUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  role?: string | null;
  companyName?: string | null;
  roleDisplayName?: string | null;
  accountAgeInDays?: number;
  createdTimeAgo?: string | null;
  updatedTimeAgo?: string | null;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  pictureUrl?: string | null;
  role: string;
}

export interface CreateUserResponse {
  id?: string;
  email?: string | null;
  name?: string | null;
  pictureUrl?: string | null;
  role?: string | null;
  temporaryPassword?: string | null;
  passwordResetEmailSent?: boolean;
  createdAt?: string;
}

export interface UpdateUserRequest {
  name: string;
  pictureUrl?: string | null;
}

// ============================================
// Company Types
// ============================================

export interface Company {
  id?: string;
  name: string;
  logoUrl?: string | null;
  industry?: string | null;
  status: string;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  locationCountry?: string | null;
  locationPostalCode?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  annualRevenue?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyDto {
  id?: string;
  name?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  status?: string | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  locationCountry?: string | null;
  locationPostalCode?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  annualRevenue?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  name: string;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status?: string | null;
}

export interface UpdateCompanyRequest {
  id: string;
  name: string;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status?: string | null;
}

// ============================================
// Department Types
// ============================================

export interface Department {
  id?: string;
  companyId: string;
  name: string;
  description?: string | null;
  headName?: string | null;
  headEmail?: string | null;
  headPhone?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  description?: string | null;
  headName?: string | null;
  headEmail?: string | null;
  headPhone?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string | null;
  memberCount?: number;
  budgetRemaining?: number | null;
  budgetAllocatedFormatted?: string | null;
  budgetSpentFormatted?: string | null;
  budgetRemainingFormatted?: string | null;
  budgetUtilizationPercentage?: number | null;
  createdTimeAgo?: string | null;
  updatedTimeAgo?: string | null;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string | null;
  headName?: string | null;
  headEmail?: string | null;
  headPhone?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
}

export interface UpdateDepartmentRequest {
  id: string;
  name: string;
  description?: string | null;
  headName?: string | null;
  headEmail?: string | null;
  headPhone?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
}

export interface DepartmentMemberDto {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
  userPictureUrl?: string | null;
  role?: string | null;
  assignedAt?: string;
  assignedByUserId?: string | null;
  departmentName?: string | null;
  departmentId?: string;
  companyName?: string | null;
  assignedByUserName?: string | null;
  roleDisplayName?: string | null;
  assignedTimeAgo?: string | null;
}

export interface AddDepartmentMemberRequest {
  userId: string;
  role: string;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id?: string;
  companyId: string;
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  progress?: number;
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  progress?: number;
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string | null;
  memberCount?: number;
  budgetRemaining?: number | null;
  budgetAllocatedFormatted?: string | null;
  budgetSpentFormatted?: string | null;
  budgetRemainingFormatted?: string | null;
  budgetUtilizationPercentage?: number | null;
  progressFormatted?: string | null;
  daysElapsed?: number | null;
  daysRemaining?: number | null;
  startDateRelative?: string | null;
  endDateRelative?: string | null;
  statusDisplayName?: string | null;
  priorityDisplayName?: string | null;
  createdTimeAgo?: string | null;
  updatedTimeAgo?: string | null;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  progress?: number;
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
}

export interface UpdateProjectRequest {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  progress?: number;
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
}

export interface ProjectMemberDto {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
  userPictureUrl?: string | null;
  role?: string | null;
  assignedAt?: string;
  assignedByUserId?: string | null;
  projectName?: string | null;
  projectId?: string;
  companyName?: string | null;
  assignedByUserName?: string | null;
  roleDisplayName?: string | null;
  assignedTimeAgo?: string | null;
}

export interface AddProjectMemberRequest {
  userId: string;
  role: string;
}

// ============================================
// Property Types
// ============================================

export interface Property {
  id?: string;
  companyId: string;
  name: string;
  description?: string | null;
  type?: string | null;
  status: string;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  locationCountry?: string | null;
  locationPostalCode?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  sizeTotalArea?: number | null;
  sizeUsableArea?: number | null;
  sizeFloors?: number | null;
  currentValue?: number | null;
  monthlyOperatingCosts?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  locationCountry?: string | null;
  locationPostalCode?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  sizeTotalArea?: number | null;
  sizeUsableArea?: number | null;
  sizeFloors?: number | null;
  currentValue?: number | null;
  monthlyOperatingCosts?: number | null;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string | null;
  deviceCount?: number;
  accessLogCount?: number;
  totalAreaFormatted?: string | null;
  usableAreaFormatted?: string | null;
  currentValueFormatted?: string | null;
  monthlyOperatingCostsFormatted?: string | null;
  createdTimeAgo?: string | null;
  updatedTimeAgo?: string | null;
}

export interface CreatePropertyRequest {
  name: string;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  locationCountry?: string | null;
  locationPostalCode?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  sizeTotalArea?: number | null;
  sizeUsableArea?: number | null;
  sizeFloors?: number | null;
  currentValue?: number | null;
  monthlyOperatingCosts?: number | null;
}

export interface UpdatePropertyRequest {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  status: string;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  locationCountry?: string | null;
  locationPostalCode?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  sizeTotalArea?: number | null;
  sizeUsableArea?: number | null;
  sizeFloors?: number | null;
  currentValue?: number | null;
  monthlyOperatingCosts?: number | null;
}

// ============================================
// Document Types
// ============================================

export interface Document {
  id?: string;
  uploadedByUserId: string;
  companyId: string;
  folderId?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  name: string;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  contentHash?: string | null;
  storagePath?: string | null;
  version?: number;
  status: string;
  accessLevel?: string | null;
  category?: string | null;
  metadata?: string | null;
  tags?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface DocumentDto {
  id?: string;
  uploadedByUserId?: string;
  companyId?: string;
  folderId?: string | null;
  name?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  contentHash?: string | null;
  storagePath?: string | null;
  version?: number;
  status?: string | null;
  accessLevel?: string | null;
  category?: string | null;
  metadata?: string | null;
  tags?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  folder?: FolderDto;
}

export interface CreateDocumentRequest {
  documentId: string;
  name: string;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  contentHash?: string | null;
  version?: number;
  accessLevel?: string | null;
  category?: string | null;
  metadata?: string | null;
  tags?: string | null;
  folderId?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
}

export interface UpdateDocumentRequest {
  name: string;
  folderId?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  accessLevel?: string | null;
  category?: string | null;
  metadata?: string | null;
  tags?: string | null;
}

export interface DocumentActionResponse {
  message?: string | null;
  documentId?: string;
  newStatus?: string | null;
}

export interface FileUploadResponse {
  fileId?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number;
  contentHash?: string | null;
  originalFileName?: string | null;
}

// ============================================
// Folder Types
// ============================================

export interface Folder {
  id?: string;
  companyId: string;
  parentFolderId?: string | null;
  name: string;
  description?: string | null;
  path?: string | null;
  createdByUserId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  childFolders?: Folder[];
  documents?: Document[];
}

export interface FolderDto {
  id?: string;
  companyId?: string;
  parentFolderId?: string | null;
  name?: string | null;
  description?: string | null;
  path?: string | null;
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  childFolders?: FolderDto[] | null;
  documents?: DocumentDto[] | null;
}

export interface CreateFolderRequest {
  name: string;
  description?: string | null;
  parentFolderId?: string | null;
}

export interface UpdateFolderRequest {
  name: string;
  description?: string | null;
}

// ============================================
// BMS Device Types
// ============================================

export interface BmsDevice {
  id?: string;
  companyId: string;
  propertyId: string;
  name: string;
  type: string;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  macAddress?: string | null;
  ipAddress?: string | null;
  firmwareVersion?: string | null;
  capabilities?: string | null;
  locationZone?: string | null;
  status: string;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  uptimePercentage?: number | null;
  lastHeartbeat?: string | null;
  installationDate?: string | null;
  warrantyExpiryDate?: string | null;
  maintenanceSchedule?: string | null;
  lastMaintenanceDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface BmsDeviceDto {
  id?: string;
  companyId?: string;
  propertyId?: string;
  name?: string | null;
  type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  macAddress?: string | null;
  ipAddress?: string | null;
  firmwareVersion?: string | null;
  locationZone?: string | null;
  status?: string | null;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  uptimePercentage?: number | null;
  lastHeartbeat?: string | null;
  installationDate?: string | null;
  warrantyExpiryDate?: string | null;
  maintenanceSchedule?: string | null;
  lastMaintenanceDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateBmsDeviceRequest {
  propertyId: string;
  name: string;
  type: string;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  macAddress?: string | null;
  ipAddress?: string | null;
  firmwareVersion?: string | null;
  capabilities?: string | null;
  locationZone?: string | null;
  status?: string | null;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  installationDate?: string | null;
  warrantyExpiryDate?: string | null;
  maintenanceSchedule?: string | null;
  notes?: string | null;
}

export interface UpdateBmsDeviceRequest {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  macAddress?: string | null;
  ipAddress?: string | null;
  firmwareVersion?: string | null;
  capabilities?: string | null;
  locationZone?: string | null;
  status?: string | null;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  lastHeartbeat?: string | null;
  installationDate?: string | null;
  warrantyExpiryDate?: string | null;
  maintenanceSchedule?: string | null;
  lastMaintenanceDate?: string | null;
  notes?: string | null;
}

// ============================================
// Access Log Types
// ============================================

export interface AccessLog {
  id?: number;
  userId?: string | null;
  companyId: string;
  propertyId: string;
  deviceId: string;
  accessType: string;
  verificationMethod: string;
  confidenceScore?: number | null;
  accessGranted?: boolean;
  denialReason?: string | null;
  anomalyDetected?: boolean;
  anomalyType?: string | null;
  locationZone?: string | null;
  direction?: string | null;
  verificationDurationMs?: number | null;
  photoCapturedUrl?: string | null;
  videoClipUrl?: string | null;
  temperatureReading?: number | null;
  timestamp?: string;
  notes?: string | null;
}

export interface AccessLogDto {
  id?: number;
  userId?: string | null;
  companyId?: string;
  propertyId?: string;
  deviceId?: string;
  accessType?: string | null;
  verificationMethod?: string | null;
  confidenceScore?: number | null;
  accessGranted?: boolean;
  denialReason?: string | null;
  anomalyDetected?: boolean;
  anomalyType?: string | null;
  locationZone?: string | null;
  direction?: string | null;
  verificationDurationMs?: number | null;
  photoCapturedUrl?: string | null;
  videoClipUrl?: string | null;
  temperatureReading?: number | null;
  timestamp?: string;
  notes?: string | null;
}

export interface CreateAccessLogRequest {
  userId?: string | null;
  propertyId: string;
  deviceId: string;
  accessType: string;
  verificationMethod: string;
  confidenceScore?: number | null;
  accessGranted?: boolean;
  denialReason?: string | null;
  anomalyDetected?: boolean;
  anomalyType?: string | null;
  locationZone?: string | null;
  direction?: string | null;
  verificationDurationMs?: number | null;
  photoCapturedUrl?: string | null;
  videoClipUrl?: string | null;
  temperatureReading?: number | null;
  notes?: string | null;
}

// ============================================
// IoT Metric Types
// ============================================

export interface IotMetric {
  id?: number;
  deviceId: string;
  propertyId: string;
  companyId: string;
  metricType: string;
  value: number;
  unit?: string | null;
  alertTriggered?: boolean;
  alertSeverity?: string | null;
  thresholdMin?: number | null;
  thresholdMax?: number | null;
  qualityIndicator?: string | null;
  timestamp?: string;
  notes?: string | null;
}

export interface IotMetricDto {
  id?: number;
  deviceId?: string;
  propertyId?: string;
  companyId?: string;
  metricType?: string | null;
  value?: number;
  unit?: string | null;
  alertTriggered?: boolean;
  alertSeverity?: string | null;
  thresholdMin?: number | null;
  thresholdMax?: number | null;
  qualityIndicator?: string | null;
  timestamp?: string;
  notes?: string | null;
}

export interface CreateIotMetricRequest {
  deviceId: string;
  propertyId: string;
  metricType: string;
  value: number;
  unit?: string | null;
  alertTriggered?: boolean;
  alertSeverity?: string | null;
  thresholdMin?: number | null;
  thresholdMax?: number | null;
  qualityIndicator?: string | null;
  notes?: string | null;
}

// ============================================
// Facial Recognition Types
// ============================================

export interface FacialRecognition {
  id?: string;
  userId: string;
  companyId: string;
  faceEncoding: string;
  encodingAlgorithm: string;
  encodingVersion?: string | null;
  confidenceThreshold?: number;
  qualityScore?: number | null;
  enrollmentPhotoUrl?: string | null;
  status: string;
  lastVerifiedAt?: string | null;
  verificationCount?: number;
  failedAttempts?: number;
  enrollmentDate?: string;
  expiryDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacialRecognitionDto {
  id?: string;
  userId?: string;
  companyId?: string;
  faceEncoding?: string | null;
  encodingAlgorithm?: string | null;
  encodingVersion?: string | null;
  confidenceThreshold?: number;
  qualityScore?: number | null;
  enrollmentPhotoUrl?: string | null;
  status?: string | null;
  lastVerifiedAt?: string | null;
  verificationCount?: number;
  failedAttempts?: number;
  enrollmentDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFacialRecognitionRequest {
  userId: string;
  faceEncoding: string;
  encodingAlgorithm: string;
  encodingVersion?: string | null;
  confidenceThreshold?: number;
  qualityScore?: number | null;
  enrollmentPhotoUrl?: string | null;
  status?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
}

export interface UpdateFacialRecognitionRequest {
  id: string;
  faceEncoding: string;
  encodingAlgorithm: string;
  encodingVersion?: string | null;
  confidenceThreshold?: number;
  qualityScore?: number | null;
  enrollmentPhotoUrl?: string | null;
  status?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string | null;
  userId?: string;
  email?: string | null;
  name?: string | null;
  companies?: UserCompanyInfo[] | null;
  expiresAt?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  companyId?: string | null;
  role?: string | null;
}

export interface RegisterResponse {
  id?: string;
  email?: string | null;
  name?: string | null;
  createdAt?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  message?: string | null;
}

export interface EmailCheckResponse {
  email?: string | null;
  available?: boolean;
}

export interface UserCompanyInfo {
  companyId?: string;
  companyName?: string | null;
  role?: string | null;
}

// ============================================
// Member Management Types
// ============================================

export interface MemberActionResponse {
  message?: string | null;
  userId?: string;
  entityId?: string;
  role?: string | null;
}

export interface UpdateMemberRoleRequest {
  role: string;
}

// ============================================
// Paginated Response Types
// ============================================

export interface PagedResult<T> {
  data?: T[] | null;
  total?: number;
  page?: number;
  pageSize?: number;
  readonly hasMore?: boolean;
}

// Specific paged result types for API responses
export type CompanyDtoPagedResult = PagedResult<CompanyDto>;
export type DepartmentDtoPagedResult = PagedResult<DepartmentDto>;
export type ProjectDtoPagedResult = PagedResult<ProjectDto>;
export type PropertyDtoPagedResult = PagedResult<PropertyDto>;
export type DocumentDtoPagedResult = PagedResult<DocumentDto>;
export type FolderDtoPagedResult = PagedResult<FolderDto>;
export type BmsDeviceDtoPagedResult = PagedResult<BmsDeviceDto>;
export type AccessLogDtoPagedResult = PagedResult<AccessLogDto>;
export type IotMetricDtoPagedResult = PagedResult<IotMetricDto>;
export type FacialRecognitionDtoPagedResult = PagedResult<FacialRecognitionDto>;
export type UserResponsePagedResult = PagedResult<UserResponse>;

// ============================================
// Legacy Type Aliases (for backwards compatibility)
// ============================================

// These maintain compatibility with existing code
export type UserRole = 'super_admin' | 'admin' | 'member' | 'viewer';
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

// ============================================
// API Response Types
// ============================================

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

// Legacy alias
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
