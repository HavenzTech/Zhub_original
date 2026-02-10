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
  Clock,
  Edit as EditIcon,
} from "lucide-react";
import { useDocumentSearch } from "@/lib/hooks/useDocumentSearch";
import { useDocumentWorkflow } from "@/lib/hooks/useDocumentWorkflow";
import { DocumentVersionHistory } from "@/features/documents/components/versions/DocumentVersionHistory";
import { DocumentSharePanel } from "@/features/documents/components/sharing/DocumentSharePanel";
import { DocumentPermissionsPanel } from "@/features/documents/components/permissions/DocumentPermissionsPanel";
import { WorkflowTimeline } from "@/features/documents/components/workflow/WorkflowTimeline";
import { WorkflowStatusBadge } from "@/features/documents/components/workflow/WorkflowStatusBadge";
import { ClassificationBadge } from "@/components/ui/classification-badge";
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

  // Workflow hook for inline workflow tab
  const {
    currentWorkflow,
    loading: workflowLoading,
    loadWorkflowStatus,
  } = useDocumentWorkflow(selectedDocumentForModal?.id || "");

  // Search state
  const {
    results: searchResults,
    loading: searchLoading,
    search,
    clearResults,
  } = useDocumentSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClassification, setFilterClassification] = useState("");

  const activeFilterCount = [filterStatus, filterClassification].filter(
    Boolean
  ).length;

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
  }, [
    router,
    loadDocuments,
    loadFolders,
    loadProjects,
    loadDepartments,
    loadUsers,
    loadProperties,
    loadDocumentTypes,
  ]);

  // Reset tab when a different document is selected
  useEffect(() => {
    setActiveTab("preview");
  }, [selectedDocumentForModal?.id]);

  // Load workflow when workflow tab is opened
  useEffect(() => {
    if (selectedDocumentForModal?.id && activeTab === "workflow") {
      loadWorkflowStatus();
    }
  }, [selectedDocumentForModal?.id, activeTab, loadWorkflowStatus]);

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

      const cleanUpdatedDoc = {
        id: document.id,
        companyId: document.companyId,
        uploadedByUserId: document.uploadedByUserId,
        folderId:
          updates.folderId !== undefined
            ? updates.folderId
            : document.folderId,
        projectId:
          updates.projectId !== undefined
            ? updates.projectId
            : document.projectId,
        departmentId:
          updates.departmentId !== undefined
            ? updates.departmentId
            : document.departmentId,
        propertyId:
          updates.propertyId !== undefined
            ? updates.propertyId
            : document.propertyId,
        name: updates.name || document.name,
        fileType: document.fileType,
        fileSizeBytes: document.fileSizeBytes,
        contentHash: document.contentHash,
        storagePath: document.storagePath,
        version: document.version,
        status: document.status,
        accessLevel: updates.accessLevel || document.accessLevel,
        category: updates.category || document.category,
        metadata: document.metadata,
        tags: updates.tags !== undefined ? updates.tags : document.tags,
        createdAt: document.createdAt,
        updatedAt: new Date().toISOString(),
        deletedAt: document.deletedAt,
      };

      await bmsApi.documents.update(documentId, cleanUpdatedDoc);
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
        storagePath: uploadResult.fileId,
        name: formData.name,
        fileType: uploadResult.fileType || selectedFile.type || "unknown",
        fileSizeBytes: uploadResult.fileSizeBytes || selectedFile.size,
        contentHash: uploadResult.contentHash,
        version: 1,
        accessLevel: formData.accessLevel,
        folderId: formData.folderId === "root" ? null : formData.folderId,
      };

      if (formData.projectId) payload.projectId = formData.projectId;
      if (formData.propertyId) payload.propertyId = formData.propertyId;
      if (formData.category) payload.category = formData.category;
      if (formData.documentTypeId)
        payload.documentTypeId = formData.documentTypeId;
      if (formData.classification)
        payload.classification = formData.classification;
      if (formData.description) payload.description = formData.description;

      if (formData.departmentIds.length > 0) {
        payload.departmentIds = JSON.stringify(formData.departmentIds);
      }
      if (formData.userAccess.length > 0) {
        payload.userIds = JSON.stringify(
          formData.userAccess.map((u) => u.userId)
        );
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
      const docId = (newDocument as Document).id;

      if (formData.departmentIds.length > 0 && docId) {
        for (const deptId of formData.departmentIds) {
          try {
            await bmsApi.documents.assignDepartment(docId, deptId);
            console.log(`Department ${deptId} assigned to document`);
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
            console.log(
              `User ${user.userName} granted ${user.accessLevel} access`
            );
          } catch (userErr) {
            console.warn(
              `Failed to grant access to user ${user.userName}:`,
              userErr
            );
          }
        }
      }

      setDocuments((prev) => [...prev, newDocument as Document]);
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

  const handleSearchKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (
        !searchQuery.trim() &&
        !filterStatus &&
        !filterClassification
      ) {
        clearResults();
        return;
      }
      await search({
        query: searchQuery || undefined,
        status: filterStatus || undefined,
        classifications: filterClassification
          ? [filterClassification]
          : undefined,
        sortBy: "updatedAt",
        sortDirection: "desc",
        page: 1,
        pageSize: 25,
      });
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
    setFilterStatus("");
    setFilterClassification("");
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
        <div className="flex w-[300px] shrink-0 flex-col border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
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
            <div className="space-y-2 border-b border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-[12px] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-[12px] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50"
              >
                <option value="">All Classifications</option>
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
              <button
                onClick={() => {
                  setFilterStatus("");
                  setFilterClassification("");
                }}
                className="w-full rounded-md bg-stone-200 px-2.5 py-1.5 text-[12px] text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
              >
                Clear Filters
              </button>
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
                        <div className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                          No active workflow for this document.
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
                            <WorkflowStatusBadge
                              status={currentWorkflow.status}
                              currentStep={currentWorkflow.currentStepName}
                            />
                          </div>
                          <WorkflowTimeline workflow={currentWorkflow} />
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
        <div className="hidden w-[320px] shrink-0 border-l border-stone-200 bg-white lg:flex lg:flex-col dark:border-stone-700 dark:bg-stone-900">
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
    </AppLayout>
  );
}
