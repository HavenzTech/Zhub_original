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
  progress?: number; // Now auto-calculated from tasks
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // New task-based schedule tracking fields
  totalTasks?: number;
  completedTasks?: number;
  projectedDeadline?: string | null;
  updatedDeadline?: string | null;
  daysAheadOrBehind?: number | null;
  scheduleStatus?: 'ahead' | 'on_track' | 'behind' | 'unknown' | string | null;
  scheduleStatusFormatted?: string | null;
}

export interface ProjectDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  progress?: number; // Now auto-calculated from tasks (completedTasks/totalTasks × 100)
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
  // New task-based schedule tracking fields
  totalTasks?: number;
  completedTasks?: number;
  projectedDeadline?: string | null; // Initial deadline (stays fixed)
  updatedDeadline?: string | null; // Current deadline based on latest task due date
  daysAheadOrBehind?: number | null; // +3 = 3 days ahead, -2 = 2 days behind
  scheduleStatus?: 'ahead' | 'on_track' | 'behind' | 'unknown' | string | null;
  scheduleStatusFormatted?: string | null; // "3 days ahead", "On Track", "2 days behind"
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  // progress is now auto-calculated from tasks - removed from request
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
  projectedDeadline?: string | null; // Optional initial deadline
}

export interface UpdateProjectRequest {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  // progress is now auto-calculated from tasks - removed from request
  startDate?: string | null;
  endDate?: string | null;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  teamLead?: string | null;
  projectedDeadline?: string | null; // Optional initial deadline
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

// Document Status Types
export type DocumentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived' | 'obsolete' | 'rejected';
export type DocumentClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type PermissionLevel = 'viewer' | 'contributor' | 'editor' | 'manager';
export type ScopeType = 'company' | 'property' | 'tenant' | 'department' | 'project' | 'area' | 'personal';
export type WorkflowStatus = 'in_progress' | 'completed' | 'cancelled' | 'rejected';
export type RetentionAction = 'archive' | 'delete' | 'review';

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
  uploadedByUserName?: string | null;
  companyId?: string;
  folderId?: string | null;
  name?: string | null;
  fileType?: string | null;
  mimeType?: string | null;
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
  // Document Type
  documentTypeId?: string | null;
  documentTypeName?: string | null;
  documentTypeCode?: string | null;
  documentNumber?: string | null;
  classification?: string | null;
  description?: string | null;
  // Owner (distinct from uploader)
  ownedByUserId?: string | null;
  ownedByUserName?: string | null;
  // Check-out status
  checkedOutByUserId?: string | null;
  checkedOutByUserName?: string | null;
  checkedOutAt?: string | null;
  checkOutExpiresAt?: string | null;
  isCheckedOut?: boolean;
  // Review tracking
  reviewDate?: string | null;
  reviewFrequencyDays?: number | null;
  lastReviewedAt?: string | null;
  lastReviewedByUserId?: string | null;
  lastReviewedByUserName?: string | null;
  // Retention
  retentionPolicyId?: string | null;
  retentionExpiresAt?: string | null;
  legalHold?: boolean;
  // Approval
  approvedByUserId?: string | null;
  approvedByUserName?: string | null;
  approvedAt?: string | null;
  approvalNotes?: string | null;
  // Nested objects
  folder?: FolderDto;
  documentType?: DocumentTypeDto;
}

export interface CreateDocumentRequest {
  documentId: string;
  name: string;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  contentHash?: string | null;
  storagePath: string;
  version?: number;
  accessLevel?: string | null;
  category?: string | null;
  metadata?: string | null;
  tags?: string | null;
  folderId?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  // New fields
  context?: UploadContext;
  documentTypeId?: string | null;
  classification?: string | null;
  description?: string | null;
  mimeType?: string | null;
  ownedByUserId?: string | null;
  reviewFrequencyDays?: number | null;
}

export interface UploadContext {
  contextType: string;
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
  // New fields
  documentTypeId?: string | null;
  classification?: string | null;
  description?: string | null;
  ownedByUserId?: string | null;
  reviewFrequencyDays?: number | null;
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

export interface DocumentDownloadResponse {
  downloadUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  expiresInMinutes?: number;
}

export interface RejectDocumentRequest {
  reason?: string | null;
}

// ============================================
// Document Type Management
// ============================================

export interface DocumentTypeDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  allowedExtensions?: string[] | null;
  maxFileSizeBytes?: number | null;
  metadataSchema?: unknown;
  autoNumberEnabled?: boolean;
  autoNumberPrefix?: string | null;
  autoNumberSuffix?: string | null;
  autoNumberDigits?: number;
  autoNumberIncludesYear?: boolean;
  requiresApproval?: boolean;
  defaultWorkflowId?: string | null;
  defaultReviewFrequencyDays?: number | null;
  defaultRetentionPolicyId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
  createdByUserId?: string;
  createdByUserName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocumentTypeRequest {
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  allowedExtensions?: string[] | null;
  maxFileSizeBytes?: number | null;
  metadataSchema?: unknown;
  autoNumberEnabled?: boolean;
  autoNumberPrefix?: string | null;
  autoNumberSuffix?: string | null;
  autoNumberDigits?: number;
  autoNumberIncludesYear?: boolean;
  requiresApproval?: boolean;
  defaultWorkflowId?: string | null;
  defaultReviewFrequencyDays?: number | null;
  defaultRetentionPolicyId?: string | null;
  displayOrder?: number;
}

export interface UpdateDocumentTypeRequest {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  allowedExtensions?: string[] | null;
  maxFileSizeBytes?: number | null;
  metadataSchema?: unknown;
  autoNumberEnabled?: boolean;
  autoNumberPrefix?: string | null;
  autoNumberSuffix?: string | null;
  autoNumberDigits?: number;
  autoNumberIncludesYear?: boolean;
  requiresApproval?: boolean;
  defaultWorkflowId?: string | null;
  defaultReviewFrequencyDays?: number | null;
  defaultRetentionPolicyId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface FileValidationResult {
  isValid?: boolean;
  errorMessage?: string | null;
  allowedExtensions?: string[] | null;
  maxFileSizeBytes?: number | null;
}

// ============================================
// Document Versions
// ============================================

export interface DocumentVersionDto {
  id?: string;
  documentId?: string;
  versionNumber?: number;
  versionLabel?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number;
  contentHash?: string | null;
  changeSummary?: string | null;
  changeType?: string | null;
  metadata?: unknown;
  uploadedByUserId?: string;
  uploadedByUserName?: string | null;
  uploadedAt?: string;
  approvedByUserId?: string | null;
  approvedByUserName?: string | null;
  approvedAt?: string | null;
  approvalNotes?: string | null;
  isCurrent?: boolean;
  isArchived?: boolean;
}

export interface RestoreVersionRequest {
  restoreReason?: string | null;
}

export interface CreateVersionOnCheckinRequest {
  changeSummary?: string | null;
  changeType?: string | null;
}

// ============================================
// Document Check-out/Check-in
// ============================================

export interface CheckedOutDocumentDto {
  documentId?: string;
  documentName?: string | null;
  documentNumber?: string | null;
  checkedOutByUserId?: string | null;
  checkedOutByUserName?: string | null;
  checkedOutAt?: string | null;
  checkOutExpiresAt?: string | null;
  isExpired?: boolean;
  folderPath?: string | null;
}

export interface CheckoutStatusDto {
  isCheckedOut?: boolean;
  checkedOutByUserId?: string | null;
  checkedOutByUserName?: string | null;
  checkedOutByUserEmail?: string | null;
  checkedOutAt?: string | null;
  expiresAt?: string | null;
  isExpired?: boolean;
  canCheckOut?: boolean;
  canCheckIn?: boolean;
  canForceRelease?: boolean;
  message?: string | null;
}

export interface CheckoutRequest {
  durationHours?: number;
  reason?: string | null;
}

export interface CheckinRequest {
  newVersion?: CreateVersionOnCheckinRequest;
  comment?: string | null;
  discardChanges?: boolean;
}

export interface CheckoutOperationResponse {
  message?: string | null;
  documentId?: string;
  documentName?: string | null;
  success?: boolean;
  status?: CheckoutStatusDto;
  newVersion?: DocumentVersionDto;
}

export interface ForceCheckoutCancelRequest {
  reason: string;
}

// ============================================
// Document Permissions
// ============================================

export interface DocumentPermissionDto {
  id?: string;
  companyId?: string;
  documentId?: string | null;
  folderId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  roleName?: string | null;
  permissionLevel?: string | null;
  canView?: boolean;
  canDownload?: boolean;
  canPrint?: boolean;
  canComment?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canManagePermissions?: boolean;
  validFrom?: string;
  validUntil?: string | null;
  isValid?: boolean;
  appliesToChildren?: boolean;
  grantedByUserId?: string;
  grantedByUserName?: string | null;
  grantedAt?: string;
  revokedAt?: string | null;
  revokedByUserId?: string | null;
  revokedByUserName?: string | null;
  notes?: string | null;
}

export interface CreateDocumentPermissionRequest {
  documentId?: string | null;
  folderId?: string | null;
  userId?: string | null;
  departmentId?: string | null;
  projectId?: string | null;
  roleName?: string | null;
  permissionLevel: string;
  canView?: boolean | null;
  canDownload?: boolean | null;
  canPrint?: boolean | null;
  canComment?: boolean | null;
  canEdit?: boolean | null;
  canDelete?: boolean | null;
  canShare?: boolean | null;
  canManagePermissions?: boolean | null;
  validFrom?: string | null;
  validUntil?: string | null;
  appliesToChildren?: boolean;
  notes?: string | null;
}

export interface UpdateDocumentPermissionRequest {
  permissionLevel?: string | null;
  canView?: boolean | null;
  canDownload?: boolean | null;
  canPrint?: boolean | null;
  canComment?: boolean | null;
  canEdit?: boolean | null;
  canDelete?: boolean | null;
  canShare?: boolean | null;
  canManagePermissions?: boolean | null;
  validUntil?: string | null;
  appliesToChildren?: boolean | null;
  notes?: string | null;
}

export interface EffectivePermissionsDto {
  documentId?: string;
  userId?: string;
  hasAccess?: boolean;
  highestPermissionLevel?: string | null;
  canView?: boolean;
  canDownload?: boolean;
  canPrint?: boolean;
  canComment?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canManagePermissions?: boolean;
  sources?: PermissionSourceDto[] | null;
}

export interface PermissionSourceDto {
  sourceType?: string | null;
  sourceId?: string | null;
  sourceName?: string | null;
  permissionLevel?: string | null;
}

// ============================================
// Document Sharing
// ============================================

export interface DocumentShareDto {
  id?: string;
  companyId?: string;
  documentId?: string;
  documentName?: string | null;
  accessToken?: string | null;
  shareUrl?: string | null;
  shareType?: string | null;
  name?: string | null;
  hasPassword?: boolean;
  requireEmail?: boolean;
  allowedEmails?: string[] | null;
  canDownload?: boolean;
  canPrint?: boolean;
  watermarkEnabled?: boolean;
  expiresAt?: string | null;
  maxAccessCount?: number | null;
  ipWhitelist?: string[] | null;
  isActive?: boolean;
  isExpired?: boolean;
  hasReachedMaxAccess?: boolean;
  isAccessible?: boolean;
  accessCount?: number;
  lastAccessedAt?: string | null;
  lastAccessedIp?: string | null;
  createdByUserId?: string;
  createdByUserName?: string | null;
  createdAt?: string;
  deactivatedAt?: string | null;
  deactivationReason?: string | null;
}

export interface CreateDocumentShareRequest {
  shareType?: string | null;
  name?: string | null;
  password?: string | null;
  requireEmail?: boolean;
  allowedEmails?: string[] | null;
  canDownload?: boolean;
  canPrint?: boolean;
  watermarkEnabled?: boolean;
  watermarkText?: string | null;
  expiresAt?: string | null;
  maxAccessCount?: number | null;
  ipWhitelist?: string[] | null;
}

export interface UpdateDocumentShareRequest {
  name?: string | null;
  password?: string | null;
  requireEmail?: boolean;
  allowedEmails?: string[] | null;
  canDownload?: boolean;
  canPrint?: boolean;
  watermarkEnabled?: boolean;
  expiresAt?: string | null;
  maxAccessCount?: number | null;
  ipWhitelist?: string[] | null;
  isActive?: boolean;
}

export interface ShareAccessLogDto {
  id?: string;
  accessedAt?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  email?: string | null;
  action?: string | null;
  success?: boolean;
  failureReason?: string | null;
}

export interface ShareAccessRequest {
  password?: string | null;
  email?: string | null;
}

export interface ShareAccessResponse {
  success?: boolean;
  message?: string | null;
  requiresPassword?: boolean;
  requiresEmail?: boolean;
  documentName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  downloadUrl?: string | null;
  canDownload?: boolean;
  canPrint?: boolean;
  watermarkEnabled?: boolean;
  expiresAt?: string | null;
  remainingAccesses?: number | null;
}

// ============================================
// Document Search
// ============================================

export interface DocumentSearchRequest {
  query?: string | null;
  documentTypeIds?: string[] | null;
  classifications?: string[] | null;
  categories?: string[] | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  folderId?: string | null;
  includeSubfolders?: boolean;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  status?: string | null;
  ownedByUserId?: string | null;
  uploadedByUserId?: string | null;
  sortBy?: string | null;
  sortDirection?: string | null;
  page?: number;
  pageSize?: number;
}

export interface DocumentSearchResult {
  id?: string;
  name?: string | null;
  description?: string | null;
  documentNumber?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  classification?: string | null;
  category?: string | null;
  status?: string | null;
  folderId?: string | null;
  folderPath?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  uploadedByUserId?: string;
  uploadedByUserName?: string | null;
  ownedByUserId?: string | null;
  ownedByUserName?: string | null;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  relevanceScore?: number | null;
  highlights?: string | null;
}

export interface DocumentSearchResults {
  documents?: DocumentSearchResult[] | null;
  total?: number;
  page?: number;
  pageSize?: number;
  readonly totalPages?: number;
}

export interface SavedSearchDto {
  id?: string;
  companyId?: string;
  userId?: string;
  name?: string | null;
  description?: string | null;
  searchConfig?: SearchConfig;
  useCount?: number;
  lastUsedAt?: string | null;
  isFavorite?: boolean;
  displayOrder?: number;
  isShared?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchConfig {
  query?: string | null;
  documentTypeIds?: string[] | null;
  classifications?: string[] | null;
  categories?: string[] | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  folderId?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  status?: string | null;
  includeSubfolders?: boolean | null;
}

// ============================================
// Document Access & Activity
// ============================================

export interface DocumentAccessLogDto {
  id?: string;
  documentId?: string;
  versionNumber?: number | null;
  accessType?: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  durationSeconds?: number | null;
  success?: boolean;
  failureReason?: string | null;
  accessedAt?: string;
}

export interface DocumentNeedsReviewDto {
  documentId?: string;
  documentName?: string | null;
  documentNumber?: string | null;
  reviewDate?: string | null;
  daysOverdue?: number | null;
  lastReviewedAt?: string | null;
  lastReviewedByUserName?: string | null;
  folderPath?: string | null;
}

export interface DocumentUserAccessDto {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
  accessLevel?: string | null;
  grantedAt?: string;
  grantedByUserId?: string | null;
  grantedByUserName?: string | null;
}

export interface DocumentDepartmentDto {
  departmentId?: string;
  departmentName?: string | null;
  assignedAt?: string;
}

// ============================================
// Recent & Favorites
// ============================================

export interface RecentDocumentDto {
  documentId?: string;
  documentName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  folderPath?: string | null;
  accessType?: string | null;
  accessedAt?: string;
  accessCount?: number;
}

export interface FavoriteDocumentDto {
  id?: string;
  documentId?: string;
  documentName?: string | null;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  folderPath?: string | null;
  documentDescription?: string | null;
  displayOrder?: number;
  notes?: string | null;
  createdAt?: string;
}

export interface FavoriteOrderItem {
  documentId?: string;
  displayOrder?: number;
}

export interface UpdateFavoriteOrderRequest {
  items: FavoriteOrderItem[];
}

// ============================================
// Retention Policies
// ============================================

export interface RetentionPolicyDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  retentionPeriodDays?: number;
  action?: string | null;
  appliesToDocumentTypes?: string[] | null;
  appliesToClassifications?: string[] | null;
  appliesToCategories?: string[] | null;
  triggerOn?: string | null;
  notifyDaysBefore?: number | null;
  notifyOwner?: boolean;
  notifyAdmin?: boolean;
  isActive?: boolean;
  priority?: number;
  createdByUserId?: string | null;
  createdByUserName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRetentionPolicyRequest {
  name: string;
  code: string;
  description?: string | null;
  retentionPeriodDays: number;
  action: string;
  appliesToDocumentTypes?: string[] | null;
  appliesToClassifications?: string[] | null;
  appliesToCategories?: string[] | null;
  triggerOn: string;
  notifyDaysBefore?: number | null;
  notifyOwner?: boolean;
  notifyAdmin?: boolean;
  priority?: number;
}

export interface UpdateRetentionPolicyRequest {
  name: string;
  description?: string | null;
  retentionPeriodDays?: number;
  action: string;
  appliesToDocumentTypes?: string[] | null;
  appliesToClassifications?: string[] | null;
  appliesToCategories?: string[] | null;
  triggerOn: string;
  notifyDaysBefore?: number | null;
  notifyOwner?: boolean;
  notifyAdmin?: boolean;
  isActive?: boolean;
  priority?: number;
}

export interface RetentionScheduleDto {
  id?: string;
  companyId?: string;
  documentId?: string;
  documentName?: string | null;
  retentionPolicyId?: string | null;
  retentionPolicyName?: string | null;
  scheduledAction?: string | null;
  scheduledDate?: string;
  status?: string | null;
  executedAt?: string | null;
  executedByUserId?: string | null;
  executedByUserName?: string | null;
  executionNotes?: string | null;
  extendedCount?: number;
  originalScheduledDate?: string | null;
  createdAt?: string;
}

export interface LegalHoldRequest {
  enableHold?: boolean;
  reason?: string | null;
}

export interface ExtendRetentionRequest {
  extensionDays: number;
  reason?: string | null;
}

// ============================================
// Workflows
// ============================================

export interface WorkflowDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  triggerConditions?: WorkflowTriggerConditions;
  steps?: WorkflowStepDto[] | null;
  allowSkip?: boolean;
  requireAllApprovals?: boolean;
  notifyOnStart?: boolean;
  notifyOnComplete?: boolean;
  notifyOnReject?: boolean;
  defaultTaskTimeoutHours?: number;
  isActive?: boolean;
  isDefault?: boolean;
  createdByUserId?: string;
  createdByUserName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowStepDto {
  order?: number;
  type?: string | null;
  name?: string | null;
  assigneeType?: string | null;
  assigneeValue?: string | null;
  parallel?: boolean;
  timeoutHours?: number | null;
}

export interface WorkflowTriggerConditions {
  onUpload?: boolean;
  documentTypes?: string[] | null;
  classifications?: string[] | null;
  categories?: string[] | null;
}

export interface CreateWorkflowRequest {
  name: string;
  code: string;
  description?: string | null;
  triggerConditions?: WorkflowTriggerConditions;
  steps: WorkflowStepDto[];
  allowSkip?: boolean;
  requireAllApprovals?: boolean;
  notifyOnStart?: boolean;
  notifyOnComplete?: boolean;
  notifyOnReject?: boolean;
  defaultTaskTimeoutHours?: number;
  isDefault?: boolean;
}

export interface UpdateWorkflowRequest {
  name: string;
  description?: string | null;
  triggerConditions?: WorkflowTriggerConditions;
  steps: WorkflowStepDto[];
  allowSkip?: boolean;
  requireAllApprovals?: boolean;
  notifyOnStart?: boolean;
  notifyOnComplete?: boolean;
  notifyOnReject?: boolean;
  defaultTaskTimeoutHours?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface WorkflowInstanceDto {
  id?: string;
  companyId?: string;
  workflowId?: string;
  workflowName?: string | null;
  documentId?: string;
  documentName?: string | null;
  currentStepOrder?: number;
  currentStepName?: string | null;
  totalSteps?: number;
  status?: string | null;
  outcome?: string | null;
  startedAt?: string;
  startedByUserId?: string;
  startedByUserName?: string | null;
  completedAt?: string | null;
  completedByUserId?: string | null;
  completedByUserName?: string | null;
  completionNotes?: string | null;
  tasks?: WorkflowTaskDto[] | null;
}

export interface WorkflowTaskDto {
  id?: string;
  companyId?: string;
  workflowInstanceId?: string;
  documentId?: string;
  documentName?: string | null;
  stepOrder?: number;
  stepName?: string | null;
  taskType?: string | null;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  assignedToUserEmail?: string | null;
  assignedToRole?: string | null;
  assignedAt?: string;
  delegatedFromUserId?: string | null;
  delegatedFromUserName?: string | null;
  delegatedAt?: string | null;
  delegationReason?: string | null;
  dueAt?: string | null;
  isOverdue?: boolean;
  status?: string | null;
  actionTaken?: string | null;
  completedAt?: string | null;
  completedByUserId?: string | null;
  completedByUserName?: string | null;
  comments?: string | null;
}

export interface StartWorkflowRequest {
  workflowId?: string | null;
  notes?: string | null;
}

export interface CancelWorkflowRequest {
  reason: string;
}

export interface CompleteTaskRequest {
  action: string;
  comments?: string | null;
}

export interface DelegateTaskRequest {
  delegateToUserId: string;
  reason?: string | null;
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
// Folder Templates
// ============================================

export interface FolderTemplateDto {
  id?: string;
  companyId?: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  structure?: FolderTemplateStructure;
  category?: string | null;
  appliesToScope?: string | null;
  autoApply?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
  useCount?: number;
  lastUsedAt?: string | null;
  createdByUserId?: string | null;
  createdByUserName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FolderTemplateStructure {
  folders?: FolderStructureItem[] | null;
}

export interface FolderStructureItem {
  name?: string | null;
  classification?: string | null;
  defaultDocumentTypeId?: string | null;
  children?: FolderStructureItem[] | null;
}

export interface CreateFolderTemplateRequest {
  name: string;
  code: string;
  description?: string | null;
  structure: FolderTemplateStructure;
  category?: string | null;
  appliesToScope?: string | null;
  autoApply?: boolean;
  isDefault?: boolean;
}

export interface UpdateFolderTemplateRequest {
  name: string;
  description?: string | null;
  structure: FolderTemplateStructure;
  category?: string | null;
  appliesToScope?: string | null;
  autoApply?: boolean;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface ApplyFolderTemplateRequest {
  templateId: string;
  targetFolderId?: string | null;
  scopeType: string;
  scopeId: string;
}

export interface FolderTemplateApplicationDto {
  id?: string;
  templateId?: string;
  templateName?: string | null;
  scopeType?: string | null;
  scopeId?: string;
  rootFolderId?: string | null;
  foldersCreated?: number;
  appliedAt?: string;
  appliedByUserId?: string | null;
  appliedByUserName?: string | null;
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
// Task Types
// ============================================

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id?: string;
  companyId?: string;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus | string;
  priority?: TaskPriority | string | null;
  taskType?: string | null;
  createdByUserId?: string;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags?: string | null;
  notes?: string | null;
  parentTaskId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskDto {
  id?: string;
  companyId?: string;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  taskType?: string | null;
  createdByUserId?: string;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags?: string | null;
  notes?: string | null;
  parentTaskId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Joined fields from API
  createdByUserName?: string | null;
  assignedToUserName?: string | null;
  projectName?: string | null;
  departmentName?: string | null;
  propertyName?: string | null;
  subTasksCount?: number;
  completedSubTasksCount?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  status?: string | null;
  priority?: string | null;
  taskType?: string | null;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
  tags?: string | null;
  notes?: string | null;
  parentTaskId?: string | null;
}

export interface UpdateTaskRequest {
  id: string;
  title: string;
  description?: string | null;
  projectId?: string | null;
  departmentId?: string | null;
  propertyId?: string | null;
  status: string;
  priority?: string | null;
  taskType?: string | null;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  tags?: string | null;
  notes?: string | null;
  parentTaskId?: string | null;
}

// ============================================
// Expense Types
// ============================================

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseCategory = 'software' | 'contractor' | 'equipment' | 'travel' | 'other';

export interface ExpenseDto {
  id?: string;
  companyId?: string;
  projectId?: string;
  projectName?: string | null;
  description?: string | null;
  amount?: number;
  amountFormatted?: string | null;
  expenseDate?: string;
  category?: string | null;
  categoryDisplayName?: string | null;
  invoiceFileName?: string | null;
  hasInvoice?: boolean;
  status?: string | null;
  statusDisplayName?: string | null;
  submittedByUserId?: string;
  submittedByName?: string | null;
  submittedByEmail?: string | null;
  submittedAt?: string;
  submittedTimeAgo?: string | null;
  reviewedByUserId?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  reviewedTimeAgo?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseRequest {
  projectId: string;
  description: string;
  amount: number;
  expenseDate: string;
  category?: string | null;
}

export interface UpdateExpenseRequest {
  description?: string | null;
  amount?: number | null;
  expenseDate?: string | null;
  category?: string | null;
}

export interface RejectExpenseRequest {
  reason: string;
}

export interface ExpenseActionResponse {
  id?: string;
  status?: string | null;
  message?: string | null;
  newProjectBudgetSpent?: number | null;
}

export interface ProjectExpenseSummary {
  projectId?: string;
  totalExpenses?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  totalPendingAmount?: number;
  totalApprovedAmount?: number;
  totalRejectedAmount?: number;
  totalApprovedFormatted?: string | null;
  totalPendingFormatted?: string | null;
}

export interface InvoiceDownloadResponse {
  downloadUrl?: string | null;
  fileName?: string | null;
  expiresInMinutes?: number;
}

export type ExpenseDtoPagedResult = PagedResult<ExpenseDto>;

// ============================================
// Notification Types
// ============================================

export interface NotificationDto {
  id?: string;
  type?: string | null;
  title?: string | null;
  body?: string | null;
  data?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  actorUserId?: string | null;
  actorUserName?: string | null;
  actorUserPictureUrl?: string | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string;
  relativeTime?: string | null;
}

export interface UnreadCountResponse {
  count?: number;
}

export interface RegisterDeviceTokenRequest {
  token: string;
  platform: 'web' | 'ios' | 'android';
}

export type NotificationDtoPagedResult = PagedResult<NotificationDto>;

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
export type TaskDtoPagedResult = PagedResult<TaskDto>;

// ============================================
// Legacy Type Aliases (for backwards compatibility)
// ============================================

// These maintain compatibility with existing code
// New role hierarchy:
// super_admin - Global access to all companies and features
// admin - Full access within company
// dept_manager - Manage assigned departments + view company
// project_lead - Manage assigned projects + view company
// employee - View + work on assigned tasks only
export type UserRole = 'super_admin' | 'admin' | 'dept_manager' | 'project_lead' | 'employee';
export type CompanyStatus = 'active' | 'inactive' | 'pending';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type PropertyType = 'office' | 'warehouse' | 'datacenter' | 'residential' | 'industrial' | 'retail';
export type PropertyStatus = 'active' | 'inactive' | 'under-construction' | 'maintenance';
// Note: DocumentStatus, DocumentClassification, PermissionLevel, ScopeType, WorkflowStatus, RetentionAction
// are defined in the Document Types section above with expanded values
export type LegacyDocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected'; // Kept for backwards compatibility
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
