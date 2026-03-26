"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import {
  Document,
  Folder,
  UserResponse,
  DocumentTypeDto,
  DocumentSearchRequest,
  DocumentSearchResults,
  DocumentSearchResult,
} from "@/types/bms";
import { toast } from "sonner";
import FolderTreeView from "@/features/documents/components/FolderTreeView";
import DocumentPreview from "@/features/documents/components/DocumentPreview";
import DocumentChatPanel from "@/features/documents/components/DocumentChatPanel";
import {
  Upload,
  Plus,
  FolderPlus,
  RefreshCw,
  Search,
  FileText,
  SlidersHorizontal,
  X,
  XCircle,
  Clock,
  Edit as EditIcon,
  Lock,
  Unlock,
  Trash2,
  Play,
  Shield,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  FolderTree,
} from "lucide-react";
import { useDocumentSearch } from "@/lib/hooks/useDocumentSearch";
import { useDocumentCheckout } from "@/lib/hooks/useDocumentCheckout";
import { CheckoutModal } from "@/features/documents/components/checkout/CheckoutModal";
import { CheckinModal } from "@/features/documents/components/checkout/CheckinModal";
import { CheckoutStatusBadge } from "@/features/documents/components/checkout/CheckoutStatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDocumentWorkflow } from "@/lib/hooks/useDocumentWorkflow";
import { DocumentVersionHistory } from "@/features/documents/components/versions/DocumentVersionHistory";
import { DocumentSharePanel } from "@/features/documents/components/sharing/DocumentSharePanel";
import { DocumentPermissionsPanel } from "@/features/documents/components/permissions/DocumentPermissionsPanel";
import { WorkflowTimeline } from "@/features/documents/components/workflow/WorkflowTimeline";
import { StartWorkflowModal } from "@/features/documents/components/workflow/StartWorkflowModal";
import { WorkflowStatusBadge } from "@/features/documents/components/workflow/WorkflowStatusBadge";
import { ClassificationBadge } from "@/components/ui/classification-badge";
import { useRetentionPolicies } from "@/lib/hooks/useRetentionPolicies";
import type {
  UploadFormData,
  UserAccess,
} from "@/features/documents/components/UploadDocumentModal";

const UploadDocumentModal = dynamic(
  () =>
    import("@/features/documents/components/UploadDocumentModal").then(
      (mod) => ({ default: mod.UploadDocumentModal })
    ),
  { ssr: false }
);
const CreateFolderModal = dynamic(
  () => import("@/features/documents/components/CreateFolderModal"),
  { ssr: false }
);
const EditMetadataModal = dynamic(
  () => import("@/features/documents/components/EditMetadataModal"),
  { ssr: false }
);

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (date?: string | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initialFormData: UploadFormData = {
  name: "",
  status: "draft",
  accessLevel: "private",
  category: "",
  tags: "",
  folderId: null,
  projectId: null,
  propertyId: null,
  departmentIds: [],
  userAccess: [],
  gcpFolderPath: "",
  // Document control fields
  documentTypeId: null,
  classification: "internal",
  description: "",
};

export default function DocumentControlPage() {
  const router = useRouter();
  const { documents, loading, error, loadDocuments, setDocuments } =
    useDocuments();

  // Auto-collapse sidebar on mount to reduce clutter
  useEffect(() => {
    window.dispatchEvent(new Event("sidebar-collapse"));
  }, []);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [users, setUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [properties, setProperties] = useState<
    { id: string; name: string }[]
  >([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedDocumentForModal, setSelectedDocumentForModal] =
    useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [parentFolderForCreation, setParentFolderForCreation] = useState<
    string | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEditMetadataModal, setShowEditMetadataModal] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<UploadFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("preview");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounter = React.useRef(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStartWorkflowModal, setShowStartWorkflowModal] = useState(false);
  const [showCancelWorkflowConfirm, setShowCancelWorkflowConfirm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Workflow hook for inline workflow tab
  const {
    currentWorkflow,
    workflowHistory,
    loading: workflowLoading,
    loadWorkflowStatus,
    loadWorkflowHistory,
    startWorkflow,
    cancelWorkflow,
  } = useDocumentWorkflow(selectedDocumentForModal?.id || "");

  // Retention policies
  const {
    retentionPolicies,
    loadRetentionPolicies,
  } = useRetentionPolicies();
  const [applyingRetention, setApplyingRetention] = useState(false);

  // Checkout hook
  const {
    status: checkoutStatus,
    checkout,
    checkin,
    isCheckedOutByMe,
    isCheckedOutByOther,
    loadStatus: loadCheckoutStatus,
  } = useDocumentCheckout(selectedDocumentForModal?.id || "", currentUserId);

  // Search state
  const {
    results: searchResults,
    loading: searchLoading,
    search,
    clearResults,
  } = useDocumentSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterClassifications, setFilterClassifications] = useState<string[]>([]);

  const toggleFilterStatus = (value: string) => {
    setFilterStatuses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const toggleFilterClassification = (value: string) => {
    setFilterClassifications((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const activeFilterCount = filterStatuses.length + filterClassifications.length;

  // ──────────────────────────────────────────────
  // Data loading
  // ──────────────────────────────────────────────

  const loadFolders = useCallback(async () => {
    try {
      const data = await bmsApi.folders.getTree();
      setFolders(data as Folder[]);
    } catch (err) {
      console.error("Error loading folders:", err);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const response = await bmsApi.projects.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setProjects(data as { id: string; name: string }[]);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await bmsApi.departments.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setDepartments(data as { id: string; name: string }[]);
    } catch (err) {
      console.error("Error loading departments:", err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await bmsApi.users.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setUsers(
        data.map((u: UserResponse) => ({
          id: u.id || "",
          name: u.name || "",
          email: u.email || "",
        }))
      );
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const response = await bmsApi.properties.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setProperties(data as { id: string; name: string }[]);
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  }, []);

  const loadDocumentTypes = useCallback(async () => {
    try {
      const response = await bmsApi.admin.documentTypes.list();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setDocumentTypes(data as DocumentTypeDto[]);
    } catch (err) {
      console.error("Error loading document types:", err);
    }
  }, []);

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    setCurrentUserId(auth.userId ?? undefined);

    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();

    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);

    loadDocuments();
    loadFolders();
    loadProjects();
    loadDepartments();
    loadUsers();
    loadProperties();
    loadDocumentTypes();
    loadRetentionPolicies();
  }, [
    router,
    loadDocuments,
    loadFolders,
    loadProjects,
    loadDepartments,
    loadUsers,
    loadProperties,
    loadDocumentTypes,
    loadRetentionPolicies,
  ]);

  // Reset tab when a different document is selected
  useEffect(() => {
    setActiveTab("preview");
  }, [selectedDocumentForModal?.id]);

  // Load checkout status when a document is selected
  useEffect(() => {
    if (selectedDocumentForModal?.id) {
      loadCheckoutStatus();
    }
  }, [selectedDocumentForModal?.id, loadCheckoutStatus]);

  // Load workflow when workflow tab is opened
  useEffect(() => {
    if (selectedDocumentForModal?.id && activeTab === "workflow") {
      loadWorkflowStatus();
      loadWorkflowHistory();
    }
  }, [selectedDocumentForModal?.id, activeTab, loadWorkflowStatus, loadWorkflowHistory]);

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────

  const findFolderById = (
    folderId: string,
    folderList: Folder[] = folders
  ): Folder | null => {
    for (const folder of folderList) {
      if (folder.id === folderId) return folder;
      if (folder.childFolders && folder.childFolders.length > 0) {
        const found = findFolderById(folderId, folder.childFolders);
        if (found) return found;
      }
    }
    return null;
  };

  const handleOpenCreateFolderModal = (parentFolderId?: string) => {
    setParentFolderForCreation(parentFolderId || null);
    setShowCreateFolderModal(true);
  };

  const handleCreateFolder = async (
    name: string,
    description?: string,
    parentFolderId?: string,
    templateId?: string
  ) => {
    try {
      const folder = (await bmsApi.folders.create({
        name,
        description,
        parentFolderId: parentFolderId || undefined,
      })) as { id?: string };

      if (templateId && folder?.id) {
        try {
          await bmsApi.folders.createFromTemplate({
            templateId,
            targetFolderId: folder.id,
            scopeType: "project",
            scopeId: folder.id,
          });
          toast.success(`Folder "${name}" created with template structure!`);
        } catch (templateErr) {
          toast.success(`Folder "${name}" created successfully!`);
          toast.error("Failed to apply template structure", {
            description:
              templateErr instanceof Error
                ? templateErr.message
                : "Template application failed",
          });
        }
      } else {
        toast.success(`Folder "${name}" created successfully!`);
      }

      await loadFolders();
      setParentFolderForCreation(null);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create folder";
      throw new Error(errorMessage);
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      await bmsApi.folders.delete(folderId);
      toast.success("Folder and all contents deleted successfully");
      await loadFolders();
      await loadDocuments();
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to delete folder";
      toast.error(errorMessage);
    }
  };

  const handleDocumentEdit = async (documentId: string) => {
    setEditingDocumentId(documentId);
    setShowEditMetadataModal(true);
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      await bmsApi.documents.delete(documentId);
      toast.success("Document deleted successfully");
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      if (selectedDocumentForModal?.id === documentId) {
        setSelectedDocumentForModal(null);
      }
      await loadFolders();
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to delete document";
      toast.error(errorMessage);
    }
  };

  const handleDocumentApprove = async (documentId: string) => {
    try {
      await bmsApi.documents.approve(documentId);
      toast.success("Document approved successfully");
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === documentId ? { ...d, status: "approved" } : d
        )
      );
      await loadFolders();
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to approve document";
      toast.error(errorMessage);
    }
  };

  const handleDocumentReject = async (
    documentId: string,
    reason?: string
  ) => {
    try {
      await bmsApi.documents.reject(
        documentId,
        reason ? { reason } : undefined
      );
      toast.success("Document rejected");
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === documentId ? { ...d, status: "rejected" } : d
        )
      );
      await loadFolders();
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to reject document";
      toast.error(errorMessage);
    }
  };

  const handleSaveMetadata = async (
    documentId: string,
    updates: Partial<Document>
  ) => {
    try {
      const document = documents.find((d) => d.id === documentId);
      if (!document) throw new Error("Document not found");

      // Only send fields the PUT endpoint accepts
      const putPayload: Record<string, unknown> = {
        name: updates.name || document.name,
        folderId: updates.folderId !== undefined ? updates.folderId : document.folderId,
        projectId: updates.projectId !== undefined ? updates.projectId : document.projectId,
        departmentId: updates.departmentId !== undefined ? updates.departmentId : document.departmentId,
        propertyId: updates.propertyId !== undefined ? updates.propertyId : document.propertyId,
        accessLevel: updates.accessLevel || document.accessLevel,
        category: updates.category || document.category,
        metadata: document.metadata,
        tags: updates.tags !== undefined ? updates.tags : document.tags,
      };

      // Include document control fields if present
      if ((document as any).classification || (updates as any).classification) {
        putPayload.classification = (updates as any).classification || (document as any).classification;
      }
      if ((document as any).description || (updates as any).description) {
        putPayload.description = (updates as any).description || (document as any).description;
      }
      if ((document as any).documentTypeId) {
        putPayload.documentTypeId = (document as any).documentTypeId;
      }
      if ((document as any).ownedByUserId) {
        putPayload.ownedByUserId = (document as any).ownedByUserId;
      }

      const updateResult = await bmsApi.documents.update(documentId, putPayload);
      toast.success("Metadata updated successfully");

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === documentId ? { ...document, ...updates } : d
        )
      );
      await loadFolders();
      setShowEditMetadataModal(false);
      setEditingDocumentId(null);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to update metadata";
      throw new Error(errorMessage);
    }
  };

  // Drag and drop handlers for center panel
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData({
        ...initialFormData,
        name: nameWithoutExt,
        folderId: selectedFolderId,
      });
      setShowUploadModal(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFormData({ ...formData, name: nameWithoutExt });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Document name is required");
      return;
    }

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedFile);
      if (formData.folderId && formData.folderId !== "root") {
        formDataUpload.append("folderId", formData.folderId);
      }

      if (formData.projectId) {
        formDataUpload.append("context", `project:${formData.projectId}`);
      }
      if (formData.departmentIds.length > 0) {
        formDataUpload.append(
          "context",
          `dept:${formData.departmentIds[0]}`
        );
      }

      if (formData.gcpFolderPath && formData.gcpFolderPath.trim()) {
        formDataUpload.append("folderPath", formData.gcpFolderPath.trim());
      }

      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();

      if (!token || !companyId) {
        throw new Error("Authentication required. Please log in again.");
      }

      const BMS_API_BASE = process.env.NEXT_PUBLIC_API_URL;
      if (!BMS_API_BASE) {
        throw new Error(
          "API configuration error: NEXT_PUBLIC_API_URL not set"
        );
      }

      const uploadResponse = await fetch(
        `${BMS_API_BASE}/api/havenzhub/documents/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Company-Id": companyId,
          },
          body: formDataUpload,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `File upload failed: ${uploadResponse.statusText} - ${errorText}`
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload result from /documents/upload:", uploadResult);

      const documentId = crypto.randomUUID();

      const payload: Record<string, unknown> = {
        documentId: documentId,
        name: formData.name,
        fileType: uploadResult.fileType || selectedFile.type || "unknown",
        mimeType: selectedFile.type || null,
        fileSizeBytes: uploadResult.fileSizeBytes || selectedFile.size,
        contentHash: uploadResult.contentHash,
        storagePath: uploadResult.fileId,
        version: 1,
        accessLevel: formData.accessLevel,
        folderId: formData.folderId === "root" ? null : formData.folderId,
        projectId: formData.projectId || null,
        departmentId: formData.departmentIds.length > 0 ? formData.departmentIds[0] : null,
        propertyId: formData.propertyId || null,
        category: formData.category || null,
        documentTypeId: formData.documentTypeId || null,
        classification: formData.classification || "internal",
        description: formData.description || null,
        ownedByUserId: null,
        reviewFrequencyDays: null,
      };

      // Build context object
      if (formData.projectId || formData.departmentIds.length > 0 || formData.propertyId) {
        payload.context = {
          contextType: formData.projectId ? "project" : formData.departmentIds.length > 0 ? "department" : "property",
          projectId: formData.projectId || null,
          departmentId: formData.departmentIds.length > 0 ? formData.departmentIds[0] : null,
          propertyId: formData.propertyId || null,
        };
      }

      if (formData.tags?.trim()) {
        const tagsArray = formData.tags.split(",").map((t) => t.trim());
        payload.tags = JSON.stringify(tagsArray);
      }

      payload.metadata = JSON.stringify({
        originalFileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
      });

      console.log(
        "Payload being sent to POST /documents:",
        JSON.stringify(payload, null, 2)
      );

      const newDocument = await bmsApi.documents.create(payload);

      // Backend doesn't return projectId/departmentId/propertyId in the DTO,
      // so merge them from our payload into the local state
      const docWithAssociations = {
        ...(newDocument as Document),
        projectId: (payload.projectId as string) || null,
        departmentId: (payload.departmentId as string) || null,
        propertyId: (payload.propertyId as string) || null,
      };
      const docId = docWithAssociations.id;

      if (formData.departmentIds.length > 0 && docId) {
        for (const deptId of formData.departmentIds) {
          try {
            await bmsApi.documents.assignDepartment(docId, deptId);
          } catch (deptErr) {
            console.warn(`Failed to assign department ${deptId}:`, deptErr);
          }
        }
      }

      if (formData.userAccess.length > 0 && docId) {
        for (const user of formData.userAccess) {
          try {
            await bmsApi.documents.grantUserAccess(
              docId,
              user.userId,
              user.accessLevel
            );
          } catch (userErr) {
            console.warn(
              `Failed to grant access to user ${user.userName}:`,
              userErr
            );
          }
        }
      }

      setDocuments((prev) => [...prev, docWithAssociations]);
      toast.success("Document uploaded successfully!");

      await loadFolders();
      setShowUploadModal(false);
      resetForm();
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to upload document";
      toast.error(errorMessage);
      console.error("Error uploading document:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      ...initialFormData,
      folderId: selectedFolderId,
    });
  };

  const handleRefresh = () => {
    loadDocuments();
    loadFolders();
  };

  // ──────────────────────────────────────────────
  // Search handlers
  // ──────────────────────────────────────────────

  const executeSearch = useCallback(async (overrides?: { statuses?: string[]; classifications?: string[] }) => {
    const statuses = overrides?.statuses ?? filterStatuses;
    const classifications = overrides?.classifications ?? filterClassifications;

    if (!searchQuery.trim() && statuses.length === 0 && classifications.length === 0) {
      clearResults();
      return;
    }
    await search({
      query: searchQuery || undefined,
      status: statuses.length > 0 ? statuses[0] : undefined,
      classifications: classifications.length > 0 ? classifications : undefined,
      sortBy: "updatedAt",
      sortDirection: "desc",
      page: 1,
      pageSize: 25,
    });
  }, [searchQuery, filterStatuses, filterClassifications, search, clearResults]);

  const handleSearchKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await executeSearch();
    }
  };

  const handleSearchResultClick = (searchResult: DocumentSearchResult) => {
    const fullDoc = documents.find((d) => d.id === searchResult.id);
    if (fullDoc) {
      setSelectedDocumentForModal(fullDoc);
    } else {
      router.push(`/document-control/${searchResult.id}`);
    }
  };

  const handleClearAllSearch = () => {
    setSearchQuery("");
    setFilterStatuses([]);
    setFilterClassifications([]);
    clearResults();
  };

  const flatFolders = useCallback((): { id: string; name: string }[] => {
    const result: { id: string; name: string }[] = [];
    const traverse = (folderList: Folder[], prefix = "") => {
      for (const f of folderList) {
        if (!f.id) continue;
        result.push({
          id: f.id,
          name: prefix ? `${prefix} / ${f.name}` : f.name,
        });
        if (f.childFolders?.length) {
          traverse(
            f.childFolders,
            prefix ? `${prefix} / ${f.name}` : f.name
          );
        }
      }
    };
    traverse(folders);
    return result;
  }, [folders]);

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <AppLayout>
      {/* Mobile Layout */}
      <div className="flex flex-col md:hidden -mx-4 -my-4" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            Documents
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleOpenCreateFolderModal()}
              title="New folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
            {authService.hasPermission("create", "document") && (
              <Button
                size="sm"
                className="h-8 bg-accent-cyan hover:bg-accent-cyan/90 text-white"
                onClick={() => {
                  setFormData({
                    ...initialFormData,
                    folderId: selectedFolderId,
                  });
                  setSelectedFile(null);
                  setShowUploadModal(true);
                }}
              >
                <Upload className="mr-1 h-3.5 w-3.5" />
                Upload
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-modern">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-stone-500">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-3"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : (
            <FolderTreeView
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onDocumentSelect={(doc) =>
                router.push(`/document-control/${doc.id}`)
              }
              onFolderCreate={handleOpenCreateFolderModal}
              onFolderDelete={handleFolderDelete}
              showDocuments={true}
            />
          )}
        </div>
      </div>

      {/* Desktop Three-Column Layout */}
      <div
        className="hidden md:flex -mx-4 md:-mx-6 -my-4 md:-my-6"
        style={{ height: 'calc(100vh - 3.5rem)' }}
      >
        {/* ─── Left Panel: Tree, Search, Filters ─── */}
        <div className={`flex shrink-0 flex-col border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 transition-[width] duration-200 ease-in-out overflow-hidden ${showLeftSidebar ? "w-[300px]" : "w-0 border-r-0"}`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-3 py-3 dark:border-stone-700">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
              Documents
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleOpenCreateFolderModal()}
                title="New folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </Button>
              {authService.hasPermission("create", "document") && (
                <button
                  onClick={() => {
                    setFormData({
                      ...initialFormData,
                      folderId: selectedFolderId,
                    });
                    setSelectedFile(null);
                    setShowUploadModal(true);
                  }}
                  className="flex items-center gap-1 rounded-md bg-accent-cyan px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-accent-cyan/90 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="border-b border-stone-200 p-3 dark:border-stone-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search documents..."
                className="w-full rounded-md border border-stone-200 bg-white py-2 pl-8 pr-3 text-[13px] outline-none transition-colors placeholder:text-stone-400 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50 dark:placeholder:text-stone-500"
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() =>
                  setShowAdvancedFilters(!showAdvancedFilters)
                }
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors ${
                  showAdvancedFilters
                    ? "border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan"
                    : "border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:border-stone-600 dark:text-stone-400"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-cyan px-1 text-[10px] font-medium text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {(searchResults || searchQuery) && (
                <button
                  onClick={handleClearAllSearch}
                  className="text-[12px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="ml-auto rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Inline Filter Panel */}
          {showAdvancedFilters && (
            <div className="space-y-3 border-b border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "draft", label: "Draft" },
                    { value: "pending_review", label: "Pending Review" },
                    { value: "approved", label: "Approved" },
                    { value: "published", label: "Published" },
                    { value: "archived", label: "Archived" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFilterStatus(opt.value)}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        filterStatuses.includes(opt.value)
                          ? "bg-accent-cyan text-white shadow-sm"
                          : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-600 dark:hover:border-stone-500 dark:hover:text-stone-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Classification
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "public", label: "Public" },
                    { value: "internal", label: "Internal" },
                    { value: "confidential", label: "Confidential" },
                    { value: "restricted", label: "Restricted" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFilterClassification(opt.value)}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        filterClassifications.includes(opt.value)
                          ? "bg-accent-cyan text-white shadow-sm"
                          : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-600 dark:hover:border-stone-500 dark:hover:text-stone-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => executeSearch()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-cyan px-2.5 py-2 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-accent-cyan/90"
                >
                  <Search className="h-3.5 w-3.5" />
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setFilterStatuses([]);
                    setFilterClassifications([]);
                    clearResults();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-[12px] font-medium text-stone-500 shadow-sm transition-colors hover:bg-stone-100 hover:text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Search Results or Folder Tree */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-modern">
            {searchResults ? (
              <>
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Results ({searchResults.total || 0})
                  </span>
                  <button
                    onClick={() => clearResults()}
                    className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    Clear
                  </button>
                </div>
                {searchResults.documents &&
                searchResults.documents.length > 0 ? (
                  <div className="space-y-0.5">
                    {searchResults.documents.map(
                      (doc: DocumentSearchResult) => (
                        <button
                          key={doc.id}
                          onClick={() => handleSearchResultClick(doc)}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-stone-400" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-stone-900 dark:text-stone-50">
                              {doc.name}
                            </div>
                            <div className="truncate text-[11px] text-stone-400">
                              {doc.category && `${doc.category} · `}
                              {doc.fileType?.toUpperCase()}
                              {doc.folderPath &&
                                ` · ${doc.folderPath}`}
                            </div>
                          </div>
                          {doc.status && (
                            <StatusBadge
                              status={doc.status}
                              size="sm"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[12px] text-stone-400">
                    No documents found
                  </div>
                )}
              </>
            ) : (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
                  </div>
                ) : error ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-stone-500">
                      {error.message === "Failed to fetch"
                        ? "Could not connect to server"
                        : error.message}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-3"
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <FolderTreeView
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    selectedDocumentId={
                      selectedDocumentForModal?.id
                    }
                    onFolderSelect={setSelectedFolderId}
                    onDocumentSelect={(doc) =>
                      setSelectedDocumentForModal(doc)
                    }
                    onFolderCreate={handleOpenCreateFolderModal}
                    onFolderDelete={handleFolderDelete}
                    showDocuments={true}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── Center Panel: Document Preview + Tabs ─── */}
        <div
          className={`flex flex-1 flex-col overflow-hidden bg-stone-50 dark:bg-stone-950 relative ${isDraggingOver ? "ring-2 ring-inset ring-accent-cyan" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Sidebar Toggle Bar */}
          <div className="shrink-0 flex items-center justify-between border-b border-stone-200 bg-white px-2 py-1.5 dark:border-stone-700 dark:bg-stone-900">
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors"
              title={showLeftSidebar ? "Hide documents panel" : "Show documents panel"}
            >
              {showLeftSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              <FolderTree className="h-3 w-3" />
              <span className="hidden sm:inline">Documents</span>
            </button>
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="hidden lg:flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors"
              title={showRightSidebar ? "Hide AI assistant" : "Show AI assistant"}
            >
              <span className="hidden sm:inline">AI Assistant</span>
              <MessageSquare className="h-3 w-3" />
              {showRightSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
          </div>

          {selectedDocumentForModal ? (
            <>
              {/* Document Action Bar */}
              <div className="shrink-0 border-b border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">
                        {selectedDocumentForModal.name}
                      </h2>
                      <div className="mt-0.5 flex items-center gap-2">
                        {selectedDocumentForModal.status && (
                          <StatusBadge
                            status={selectedDocumentForModal.status}
                            size="sm"
                          />
                        )}
                        <span className="text-[11px] text-stone-400">
                          {selectedDocumentForModal.fileType?.toUpperCase()}
                        </span>
                        {selectedDocumentForModal.version && (
                          <span className="text-[11px] text-stone-400">
                            v{selectedDocumentForModal.version}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedDocumentForModal.id && (
                      <>
                        <CheckoutStatusBadge
                          isCheckedOut={checkoutStatus?.isCheckedOut}
                          checkedOutByUserName={checkoutStatus?.checkedOutByUserName}
                          checkedOutAt={checkoutStatus?.checkedOutAt}
                          checkOutExpiresAt={checkoutStatus?.expiresAt}
                          isCheckedOutByMe={isCheckedOutByMe}
                        />
                        {!checkoutStatus?.isCheckedOut && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[12px] border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                            onClick={() => setShowCheckoutModal(true)}
                          >
                            <Lock className="mr-1 h-3 w-3" />
                            Check Out
                          </Button>
                        )}
                        {isCheckedOutByMe && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[12px] border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950"
                            onClick={() => setShowCheckinModal(true)}
                          >
                            <Unlock className="mr-1 h-3 w-3" />
                            Check In
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[12px] border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                          onClick={() =>
                            handleDocumentEdit(
                              selectedDocumentForModal.id!
                            )
                          }
                        >
                          <EditIcon className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        setSelectedDocumentForModal(null)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tab Buttons */}
                <div className="flex gap-1 px-4 pb-2">
                  {["preview", "details", "versions", "permissions", "workflow", "shares", "audit"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        activeTab === tab
                          ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                          : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto">
                {activeTab === "preview" && (
                  <div className="h-full">
                    <DocumentPreview
                      document={selectedDocumentForModal}
                      onDownload={(doc) =>
                        window.open(
                          `/api/document-download/${doc.id}`,
                          "_blank"
                        )
                      }
                    />
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="p-4 space-y-4">
                    {/* Document Information */}
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">Document Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">Status</span>
                          <StatusBadge status={selectedDocumentForModal.status || "draft"} />
                        </div>
                        {(selectedDocumentForModal as any).classification && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500 dark:text-stone-400">Classification</span>
                            <ClassificationBadge level={(selectedDocumentForModal as any).classification} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">Category</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{selectedDocumentForModal.category || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">File Type</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50 uppercase">{selectedDocumentForModal.fileType || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">Version</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50">v{selectedDocumentForModal.version || 1}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">File Size</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatFileSize(selectedDocumentForModal.fileSizeBytes)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">Access Level</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50 capitalize">{selectedDocumentForModal.accessLevel || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">Timestamps</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">Created</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatDate(selectedDocumentForModal.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500 dark:text-stone-400">Last Updated</span>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatDate(selectedDocumentForModal.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedDocumentForModal.tags && (
                      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(typeof selectedDocumentForModal.tags === "string"
                            ? (() => { try { return JSON.parse(selectedDocumentForModal.tags as string); } catch { return (selectedDocumentForModal.tags as string).split(","); } })()
                            : selectedDocumentForModal.tags
                          ).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-600 dark:text-stone-300"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Retention Policy */}
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent-cyan" />
                        Retention Policy
                      </h3>
                      {(selectedDocumentForModal as any).retentionPolicyId ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500 dark:text-stone-400">Policy</span>
                            <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                              {retentionPolicies.find(p => p.id === (selectedDocumentForModal as any).retentionPolicyId)?.name || "Applied"}
                            </span>
                          </div>
                          {(selectedDocumentForModal as any).retentionExpiresAt && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-stone-500 dark:text-stone-400">Expires</span>
                              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                                {formatDate((selectedDocumentForModal as any).retentionExpiresAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : retentionPolicies.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm text-stone-500 dark:text-stone-400">No retention policy applied.</p>
                          <div className="flex items-center gap-2">
                            <select
                              id="retention-policy-select"
                              className="flex-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-sm text-stone-900 dark:text-stone-50"
                              defaultValue=""
                            >
                              <option value="" disabled>Select a policy...</option>
                              {retentionPolicies.filter(p => p.isActive !== false).map(policy => (
                                <option key={policy.id} value={policy.id}>
                                  {policy.name} ({policy.retentionPeriodDays} days)
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              disabled={applyingRetention}
                              onClick={async () => {
                                const select = document.getElementById("retention-policy-select") as HTMLSelectElement;
                                const policyId = select?.value;
                                if (!policyId || !selectedDocumentForModal.id) return;
                                setApplyingRetention(true);
                                try {
                                  await bmsApi.documentRetention.applyPolicy(selectedDocumentForModal.id, policyId);
                                  toast.success("Retention policy applied");
                                  loadDocuments();
                                } catch (err) {
                                  toast.error("Failed to apply retention policy");
                                } finally {
                                  setApplyingRetention(false);
                                }
                              }}
                            >
                              {applyingRetention ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          No retention policies configured. Create one in Settings → Admin → Retention Policies.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "versions" && selectedDocumentForModal.id && (
                  <div className="p-4">
                    <DocumentVersionHistory
                      documentId={selectedDocumentForModal.id}
                      currentVersion={selectedDocumentForModal.version}
                    />
                  </div>
                )}

                {activeTab === "permissions" && selectedDocumentForModal.id && (
                  <div className="p-4">
                    <DocumentPermissionsPanel
                      documentId={selectedDocumentForModal.id}
                      documentName={selectedDocumentForModal.name || undefined}
                    />
                  </div>
                )}

                {activeTab === "workflow" && selectedDocumentForModal.id && (
                  <div className="p-4">
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">Workflow Status</h3>
                      {workflowLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
                        </div>
                      ) : !currentWorkflow ? (
                        <div className="space-y-4">
                          {/* Show last completed workflow if there is one */}
                          {workflowHistory.length > 0 && (() => {
                            const lastWorkflow = workflowHistory[0];
                            return (
                              <div className={`p-4 rounded-lg border ${
                                lastWorkflow.status === "completed"
                                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                                  : lastWorkflow.status === "rejected"
                                  ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                                  : "bg-stone-50 border-stone-200 dark:bg-stone-800/50 dark:border-stone-700"
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                                    {lastWorkflow.workflowName}
                                  </span>
                                  <WorkflowStatusBadge
                                    status={lastWorkflow.status}
                                    currentStep={lastWorkflow.currentStepName}
                                  />
                                </div>
                                <p className={`text-sm ${
                                  lastWorkflow.status === "completed"
                                    ? "text-emerald-800 dark:text-emerald-300"
                                    : lastWorkflow.status === "rejected"
                                    ? "text-red-800 dark:text-red-300"
                                    : "text-stone-700 dark:text-stone-300"
                                }`}>
                                  {lastWorkflow.status === "completed"
                                    ? "This document has been approved."
                                    : lastWorkflow.status === "rejected"
                                    ? "This document was rejected."
                                    : "This workflow was cancelled."}
                                </p>
                                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                  {lastWorkflow.completedAt
                                    ? formatDate(lastWorkflow.completedAt)
                                    : formatDate(lastWorkflow.startedAt)}
                                  {lastWorkflow.completedByUserName && ` by ${lastWorkflow.completedByUserName}`}
                                </div>
                              </div>
                            );
                          })()}
                          <div className="text-center">
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                              {workflowHistory.length > 0 ? "Start another workflow if needed." : "No active workflow for this document."}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950"
                              onClick={() => setShowStartWorkflowModal(true)}
                            >
                              <Play className="mr-1 h-3 w-3" />
                              Start Workflow
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-stone-900 dark:text-stone-50">{currentWorkflow.workflowName}</div>
                              <div className="text-xs text-stone-500 dark:text-stone-400">
                                Started {formatDate(currentWorkflow.startedAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <WorkflowStatusBadge
                                status={currentWorkflow.status}
                                currentStep={currentWorkflow.currentStepName}
                              />
                              {currentWorkflow.status !== "completed" && currentWorkflow.status !== "cancelled" && currentWorkflow.status !== "rejected" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[12px] border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
                                  onClick={() => setShowCancelWorkflowConfirm(true)}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                          <WorkflowTimeline workflow={currentWorkflow} />
                          {(currentWorkflow.status === "completed" || currentWorkflow.status === "cancelled" || currentWorkflow.status === "rejected") && (
                            <div className={`mt-4 p-4 rounded-lg border ${
                              currentWorkflow.status === "completed"
                                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                                : currentWorkflow.status === "rejected"
                                ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                                : "bg-stone-50 border-stone-200 dark:bg-stone-800/50 dark:border-stone-700"
                            }`}>
                              <p className={`text-sm font-medium ${
                                currentWorkflow.status === "completed"
                                  ? "text-emerald-800 dark:text-emerald-300"
                                  : currentWorkflow.status === "rejected"
                                  ? "text-red-800 dark:text-red-300"
                                  : "text-stone-700 dark:text-stone-300"
                              }`}>
                                {currentWorkflow.status === "completed"
                                  ? "This document has been approved."
                                  : currentWorkflow.status === "rejected"
                                  ? "This document was rejected."
                                  : "This workflow was cancelled."}
                              </p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                You can start a new workflow if needed.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950"
                                onClick={() => setShowStartWorkflowModal(true)}
                              >
                                <Play className="mr-1 h-3 w-3" />
                                Start New Workflow
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "shares" && selectedDocumentForModal.id && (
                  <div className="p-4">
                    <DocumentSharePanel
                      documentId={selectedDocumentForModal.id}
                      documentName={selectedDocumentForModal.name || undefined}
                    />
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800">
                      <Clock className="h-6 w-6 text-stone-400 dark:text-stone-500" />
                    </div>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                      Audit Trail
                    </p>
                    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                      Coming soon
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800">
                <FileText className="h-8 w-8 text-stone-400 dark:text-stone-500" />
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Select a document to preview
              </p>
              <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                or drag files here to upload
              </p>
            </div>
          )}

          {/* Drag overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-accent-cyan/5 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-accent-cyan bg-white/90 dark:bg-stone-900/90 px-12 py-10">
                <Upload className="h-10 w-10 text-accent-cyan" />
                <p className="text-sm font-medium text-stone-900 dark:text-stone-50">Drop file to upload</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">File will be uploaded to the current folder</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Panel: AI Chat ─── */}
        <div className={`hidden shrink-0 border-l border-stone-200 bg-white lg:flex lg:flex-col dark:border-stone-700 dark:bg-stone-900 transition-[width] duration-200 ease-in-out overflow-hidden ${showRightSidebar ? "w-[320px]" : "w-0 border-l-0"}`}>
          <DocumentChatPanel document={selectedDocumentForModal} />
        </div>
      </div>

      {/* ─── Modals ─── */}
      <UploadDocumentModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        formData={formData}
        setFormData={setFormData}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        isUploading={isUploading}
        folders={folders}
        projects={projects}
        departments={departments}
        properties={properties}
        users={users}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => {
          setShowCreateFolderModal(false);
          setParentFolderForCreation(null);
        }}
        onSubmit={handleCreateFolder}
        parentFolderId={parentFolderForCreation || undefined}
        parentFolderName={
          parentFolderForCreation
            ? findFolderById(parentFolderForCreation)?.name
            : undefined
        }
      />

      <EditMetadataModal
        isOpen={showEditMetadataModal}
        onClose={() => {
          setShowEditMetadataModal(false);
          setEditingDocumentId(null);
        }}
        document={
          editingDocumentId
            ? documents.find((d) => d.id === editingDocumentId) || null
            : null
        }
        onSave={handleSaveMetadata}
        onDelete={handleDocumentDelete}
        folders={folders}
        projects={projects}
        departments={departments}
        properties={properties}
      />

      {/* Checkout / Checkin Modals */}
      {selectedDocumentForModal && (
        <>
          <CheckoutModal
            open={showCheckoutModal}
            onOpenChange={setShowCheckoutModal}
            documentName={selectedDocumentForModal.name}
            onCheckout={async (durationHours) => {
              await checkout(durationHours);
              setShowCheckoutModal(false);
            }}
          />
          <CheckinModal
            open={showCheckinModal}
            onOpenChange={setShowCheckinModal}
            documentName={selectedDocumentForModal.name}
            onCheckin={async (request) => {
              await checkin(request);
              setShowCheckinModal(false);
            }}
          />
          <StartWorkflowModal
            open={showStartWorkflowModal}
            onOpenChange={setShowStartWorkflowModal}
            documentName={selectedDocumentForModal.name}
            onStartWorkflow={async (workflowId) => {
              await startWorkflow(workflowId);
              await loadWorkflowStatus();
              await loadWorkflowHistory();
              setShowStartWorkflowModal(false);
            }}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedDocumentForModal?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (selectedDocumentForModal?.id) {
                  await handleDocumentDelete(selectedDocumentForModal.id);
                  setShowDeleteConfirm(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showCancelWorkflowConfirm} onOpenChange={setShowCancelWorkflowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the workflow on &quot;{selectedDocumentForModal?.name}&quot;? This will stop all pending approval steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Running</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                await cancelWorkflow("Cancelled by user");
                await loadWorkflowStatus();
                await loadWorkflowHistory();
                setShowCancelWorkflowConfirm(false);
              }}
            >
              Cancel Workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
