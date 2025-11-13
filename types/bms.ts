// types/bms.ts - Backend-aligned Data Models for Havenz BMS

// Core Entity Types
export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User Management Types
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  role?: string; // User's role in the current company context
}

export interface CreateUserRequest {
  email: string;
  name: string;
  pictureUrl?: string;
  role: UserRole; // Role to assign in the current company
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  role: string;
  temporaryPassword: string; // Temporary password for the user
  createdAt: string;
}

export interface UpdateUserRequest {
  name: string;
  pictureUrl?: string;
  // Email and role cannot be changed via update endpoint
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

export interface Folder {
  id: string;
  companyId: string;
  parentFolderId?: string;
  name: string;
  description?: string;
  path: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Navigation properties (optional, loaded from API)
  childFolders?: Folder[];
  documents?: Document[];
}

export interface Document {
  id: string;
  uploadedByUserId: string;
  companyId: string;
  folderId?: string;
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
  // Navigation property (optional)
  folder?: Folder;
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
