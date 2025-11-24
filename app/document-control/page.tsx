// app/document-control/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import {
  Document,
  DocumentStatus,
  DocumentAccessLevel,
  DocumentCategory,
  Folder,
} from "@/types/bms";
import { toast } from "sonner";
import FolderTreeView from "@/components/FolderTreeView";
import CreateFolderModal from "@/components/CreateFolderModal";
import EditMetadataModal from "@/components/EditMetadataModal";
import DocumentViewModal from "@/components/DocumentViewModal";
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Lock,
  Unlock,
  History,
  Calendar,
  User,
  Building2,
  Shield,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  File,
  FolderOpen,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DocumentControlPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [selectedDocumentForModal, setSelectedDocumentForModal] =
    useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
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
  const [formData, setFormData] = useState({
    name: "",
    status: "draft" as DocumentStatus,
    accessLevel: "private" as DocumentAccessLevel,
    category: "" as DocumentCategory | "",
    tags: "",
    folderId: null as string | null,
    projectId: null as string | null,
    departmentId: null as string | null,
    gcpFolderPath: "",
  });

  // Initialize auth on mount
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
  }, [router]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bmsApi.documents.getAll();
      setDocuments(data as Document[]);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to load documents";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const data = await bmsApi.folders.getTree();
      setFolders(data as Folder[]);
    } catch (err) {
      console.error("Error loading folders:", err);
      // Don't show error toast for folders, just log it
    }
  };

  const loadProjects = async () => {
    try {
      const data = await bmsApi.projects.getAll();
      setProjects(data as any[]);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await bmsApi.departments.getAll();
      setDepartments(data as any[]);
    } catch (err) {
      console.error("Error loading departments:", err);
    }
  };

  const handleCreateFolder = async (
    name: string,
    description?: string,
    parentFolderId?: string
  ) => {
    try {
      const payload = {
        name,
        description,
        parentFolderId: parentFolderId || undefined,
      };
      await bmsApi.folders.create(payload);
      toast.success(`Folder "${name}" created successfully!`);
      await loadFolders();
      setParentFolderForCreation(null);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create folder";
      throw new Error(errorMessage);
    }
  };

  const handleOpenCreateFolderModal = (parentFolderId?: string) => {
    setParentFolderForCreation(parentFolderId || null);
    setShowCreateFolderModal(true);
  };

  // Helper to find folder by ID (for getting parent folder name)
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
      await bmsApi.documents.softDelete(documentId);
      toast.success("Document deleted successfully");
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      await loadFolders(); // Refresh folder tree to update counts
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to delete document";
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

      // Only send the fields that can be updated (exclude navigation properties)
      const cleanUpdatedDoc = {
        id: document.id,
        companyId: document.companyId,
        uploadedByUserId: document.uploadedByUserId,
        folderId: document.folderId,
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

      // Update local state with the cleaned document
      setDocuments((prev) =>
        prev.map((d) => (d.id === documentId ? { ...document, ...updates } : d))
      );
      await loadFolders(); // Refresh tree
      setShowEditMetadataModal(false);
      setEditingDocumentId(null);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update metadata";
      throw new Error(errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate the document name from filename if not set
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
      // Step 1: Upload the actual file to storage
      const formDataUpload = new FormData();
      formDataUpload.append("file", selectedFile);
      if (formData.folderId && formData.folderId !== "root") {
        formDataUpload.append("folderId", formData.folderId);
      }

      // Add project/department context for access control
      if (formData.projectId) {
        formDataUpload.append("context", `project:${formData.projectId}`);
      }
      if (formData.departmentId) {
        formDataUpload.append("context", `dept:${formData.departmentId}`);
      }

      // Add GCP folder path for cloud storage organization
      if (formData.gcpFolderPath && formData.gcpFolderPath.trim()) {
        formDataUpload.append("folderPath", formData.gcpFolderPath.trim());
      }

      // Get auth token and company ID
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();

      if (!token || !companyId) {
        throw new Error("Authentication required. Please log in again.");
      }

      const BMS_API_BASE = process.env.NEXT_PUBLIC_BMS_API_BASE_URL;
      if (!BMS_API_BASE) {
        throw new Error(
          "API configuration error: NEXT_PUBLIC_BMS_API_BASE_URL not set"
        );
      }

      const uploadResponse = await fetch(
        `${BMS_API_BASE}/api/havenzhub/document/upload`,
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

      // Step 2: Save document metadata to database
      // IMPORTANT: Use documentId from upload response to ensure filename UUID matches database ID
      const payload: any = {
        documentId: uploadResult.documentId, // UUID from upload endpoint (matches filename)
        name: formData.name,
        fileType: uploadResult.fileType || selectedFile.type || "unknown",
        fileSizeBytes: uploadResult.fileSizeBytes || selectedFile.size,
        contentHash: uploadResult.contentHash,
        storagePath: uploadResult.storagePath,
        version: 1,
        accessLevel: formData.accessLevel,
        folderId: formData.folderId === "root" ? null : formData.folderId,
      };

      // Only add optional fields if they have values
      if (formData.category) payload.category = formData.category;

      // Tags: Convert to JSON string array for backend JSONB storage
      if (formData.tags?.trim()) {
        const tagsArray = formData.tags.split(",").map((t) => t.trim());
        payload.tags = JSON.stringify(tagsArray);
      }

      // Metadata: Convert to JSON string for backend JSONB storage
      payload.metadata = JSON.stringify({
        originalFileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
      });

      const newDocument = await bmsApi.documents.create(payload);

      setDocuments((prev) => [...prev, newDocument as Document]);
      toast.success("Document uploaded successfully!");

      // Refresh folders to update document counts in tree
      await loadFolders();

      setShowUploadModal(false);

      // Reset form
      setSelectedFile(null);
      setFormData({
        name: "",
        status: "draft" as DocumentStatus,
        accessLevel: "private" as DocumentAccessLevel,
        category: "" as DocumentCategory | "",
        tags: "",
        folderId: selectedFolderId,
        projectId: null,
        departmentId: null,
        gcpFolderPath: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to upload document";
      toast.error(errorMessage);
      console.error("Error uploading document:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    // Filter by selected folder
    const folderMatch =
      selectedFolderId === null || doc.folderId === selectedFolderId;

    // Filter by search term
    const searchMatch =
      !searchTerm ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase());

    return folderMatch && searchMatch;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-blue-100 text-blue-800";
      case "private":
        return "bg-orange-100 text-orange-800";
      case "restricted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "public":
        return <Unlock className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      case "restricted":
        return <Shield className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getFileTypeIcon = (type?: string) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("pdf"))
      return <FileText className="w-6 h-6 text-red-600" />;
    if (lowerType.includes("doc"))
      return <FileText className="w-6 h-6 text-blue-600" />;
    if (lowerType.includes("xls") || lowerType.includes("sheet"))
      return <FileText className="w-6 h-6 text-green-600" />;
    if (lowerType.includes("ppt"))
      return <FileText className="w-6 h-6 text-orange-600" />;
    if (lowerType.includes("txt"))
      return <File className="w-6 h-6 text-gray-600" />;
    return <FileText className="w-6 h-6 text-gray-600" />;
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedDocument(document)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileTypeIcon(document.fileType)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {document.name}
              </CardTitle>
              <p className="text-sm text-gray-600">v{document.version}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-2">
            <Badge className={`${getStatusColor(document.status)} text-xs`}>
              {document.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium uppercase">
              {document.fileType || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">
              {formatFileSize(document.fileSizeBytes)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              {getAccessLevelIcon(document.accessLevel)} Access:
            </span>
            <Badge
              className={`${getAccessLevelColor(
                document.accessLevel
              )} text-xs capitalize`}
            >
              {document.accessLevel}
            </Badge>
          </div>
          {document.category && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Category:</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {document.category}
              </Badge>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
          Updated {formatDate(document.updatedAt)}
        </div>
      </CardContent>
    </Card>
  );

  const DocumentDetails = ({ document }: { document: Document }) => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setSelectedDocument(null)}>
        ← Back to Documents
      </Button>

      {/* Document Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              {getFileTypeIcon(document.fileType)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {document.name}
              </h1>
              <p className="text-gray-600 mb-4">Version {document.version}</p>

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                <Badge
                  className={`${getAccessLevelColor(
                    document.accessLevel
                  )} flex items-center gap-1`}
                >
                  {getAccessLevelIcon(document.accessLevel)}
                  {document.accessLevel}
                </Badge>
                {document.category && (
                  <Badge variant="secondary" className="capitalize">
                    {document.category}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File Type:</span>
                  <div className="font-medium uppercase">
                    {document.fileType || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">File Size:</span>
                  <div className="font-medium">
                    {formatFileSize(document.fileSizeBytes)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Document ID:</span>
                  <div className="font-medium font-mono text-xs">
                    {document.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Access Level</span>
              <Badge
                className={`${getAccessLevelColor(
                  document.accessLevel
                )} flex items-center gap-1`}
              >
                {getAccessLevelIcon(document.accessLevel)}
                {document.accessLevel}
              </Badge>
            </div>
            {document.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <Badge variant="secondary" className="capitalize">
                  {document.category}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium">v{document.version}</span>
            </div>
            {document.contentHash && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Hash</span>
                <span className="text-sm font-mono">
                  {document.contentHash.slice(0, 16)}...
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium">
                {formatDate(document.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">
                {formatDate(document.updatedAt)}
              </span>
            </div>
            {document.deletedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deleted</span>
                <span className="text-sm font-medium text-red-600">
                  {formatDate(document.deletedAt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company ID</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {document.companyId.slice(0, 8)}...
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uploaded By</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {document.uploadedByUserId.slice(0, 8)}...
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Storage Path:</span>
              <div className="font-medium font-mono text-xs mt-1 break-all">
                {document.storagePath || "N/A"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Size</span>
              <span className="text-sm font-medium">
                {formatFileSize(document.fileSizeBytes)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading documents...
          </h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading documents
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDocuments}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedDocument ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Document Control
              </h1>
              <p className="text-gray-600">
                Manage and track all organizational documents
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  loadDocuments();
                  loadFolders();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenCreateFolderModal()}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
              {authService.hasPermission("create", "document") && (
                <Button
                  onClick={() => {
                    setFormData({ ...formData, folderId: selectedFolderId });
                    setShowUploadModal(true);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="hidden grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter((d) => d.status === "approved").length}
                    </div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter((d) => d.status === "pending").length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatFileSize(
                        documents.reduce(
                          (sum, d) => sum + (d.fileSizeBytes || 0),
                          0
                        )
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Size</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Folder Tree */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader>
                <CardTitle className="text-base">Folders</CardTitle>
              </CardHeader>
              <CardContent>
                <FolderTreeView
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  selectedDocumentId={selectedDocumentForModal?.id}
                  onFolderSelect={setSelectedFolderId}
                  onDocumentSelect={(doc) => {
                    setSelectedDocumentForModal(doc);
                    setShowDocumentModal(true);
                  }}
                  onFolderCreate={handleOpenCreateFolderModal}
                  onFolderDelete={handleFolderDelete}
                  onDocumentEdit={handleDocumentEdit}
                  onDocumentDelete={handleDocumentDelete}
                  showDocuments={true}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <DocumentDetails document={selectedDocument} />
      )}

      {/* Upload Document Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the system. Fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* File Upload */}
              <div className="grid gap-2">
                <Label htmlFor="file">File *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.getElementById(
                          "file"
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <div className="text-sm text-gray-600">
                    <p>Selected: {selectedFile.name}</p>
                    <p>Size: {formatFileSize(selectedFile.size)}</p>
                    <p>Type: {selectedFile.type || "Unknown"}</p>
                  </div>
                )}
              </div>

              {/* Document Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter document name"
                  required
                />
              </div>

              {/* Status and Access Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as DocumentStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select
                    value={formData.accessLevel}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        accessLevel: value as DocumentAccessLevel,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category and Folder */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value as DocumentCategory,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="folder">Folder</Label>
                  <Select
                    value={formData.folderId || "root"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        folderId: value === "root" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root (No Folder)</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project and Department */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select
                    value={formData.projectId || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        projectId: value === "none" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Link to project for access control
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select
                    value={formData.departmentId || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        departmentId: value === "none" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Link to department for access control
                  </p>
                </div>
              </div>

              {/* GCP Folder Path */}
              <div className="grid gap-2">
                <Label htmlFor="gcpFolderPath">
                  GCP Folder Path (Optional)
                </Label>
                <Input
                  id="gcpFolderPath"
                  value={formData.gcpFolderPath}
                  onChange={(e) =>
                    setFormData({ ...formData, gcpFolderPath: e.target.value })
                  }
                  placeholder="e.g., contracts/2024 or invoices"
                />
                <p className="text-xs text-gray-500">
                  Organize files in cloud storage subfolder
                </p>
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="e.g., important, 2024, budget"
                />
                <p className="text-xs text-gray-500">
                  Separate multiple tags with commas
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
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

      {/* Edit Metadata Modal */}
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
      />

      {/* Document View Modal */}
      <DocumentViewModal
        document={selectedDocumentForModal}
        open={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          setSelectedDocumentForModal(null);
        }}
      />
    </div>
  );
}
