"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { DocumentDetails } from "@/features/documents/components/DocumentDetails";
import { DocumentStats } from "@/features/documents/components/DocumentStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Document, Folder } from "@/types/bms";
import { toast } from "sonner";
import FolderTreeView from "@/features/documents/components/FolderTreeView";
import { Upload, Plus, RefreshCw } from "lucide-react";

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
const DocumentViewModal = dynamic(
  () => import("@/features/documents/components/DocumentViewModal"),
  { ssr: false }
);

interface DocumentFormData {
  name: string;
  status: string;
  accessLevel: string;
  category: string;
  tags: string;
  folderId: string | null;
  projectId: string | null;
  departmentId: string | null;
  gcpFolderPath: string;
}

const initialFormData: DocumentFormData = {
  name: "",
  status: "draft",
  accessLevel: "private",
  category: "",
  tags: "",
  folderId: null,
  projectId: null,
  departmentId: null,
  gcpFolderPath: "",
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
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
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);

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
      const data = await bmsApi.projects.getAll();
      setProjects(data as { id: string; name: string }[]);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const data = await bmsApi.departments.getAll();
      setDepartments(data as { id: string; name: string }[]);
    } catch (err) {
      console.error("Error loading departments:", err);
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
  }, [router, loadDocuments, loadFolders, loadProjects, loadDepartments]);

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
      await loadFolders();
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

      setDocuments((prev) =>
        prev.map((d) => (d.id === documentId ? { ...document, ...updates } : d))
      );
      await loadFolders();
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
      if (formData.departmentId) {
        formDataUpload.append("context", `dept:${formData.departmentId}`);
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
      console.log("📤 Upload result from /documents/upload:", uploadResult);

      // Map upload response fields to document payload
      // Upload returns: fileId, fileType, fileSizeBytes, contentHash, originalFileName
      const payload: Record<string, unknown> = {
        name: formData.name,
        fileType: uploadResult.fileType || selectedFile.type || "unknown",
        fileSizeBytes: uploadResult.fileSizeBytes || selectedFile.size,
        contentHash: uploadResult.contentHash,
        storagePath: uploadResult.fileId, // fileId is the GCS path
        version: 1,
        accessLevel: formData.accessLevel,
        folderId: formData.folderId === "root" ? null : formData.folderId,
      };

      if (formData.category) payload.category = formData.category;

      if (formData.tags?.trim()) {
        const tagsArray = formData.tags.split(",").map((t) => t.trim());
        payload.tags = JSON.stringify(tagsArray);
      }

      payload.metadata = JSON.stringify({
        originalFileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
      });

      console.log("📝 Payload being sent to POST /documents:", JSON.stringify(payload, null, 2));

      const newDocument = await bmsApi.documents.create(payload);

      setDocuments((prev) => [...prev, newDocument as Document]);
      toast.success("Document uploaded successfully!");

      await loadFolders();
      setShowUploadModal(false);
      resetForm();
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to upload document";
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

  return (
    <AppLayout>
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
                <Button variant="outline" onClick={handleRefresh}>
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
            <DocumentStats documents={documents} className="hidden" />

            {/* Folder Tree */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="h-[calc(100vh-12rem)]">
                <CardHeader>
                  <CardTitle className="text-base">Folders</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading documents...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-red-600 text-xl">!</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Unable to load documents
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 max-w-md">
                          {error.message === "Failed to fetch"
                            ? "Could not connect to the server. Please check your connection and try again."
                            : error.message}
                        </p>
                        <Button variant="outline" onClick={handleRefresh}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <DocumentDetails
            document={selectedDocument}
            onBack={() => setSelectedDocument(null)}
          />
        )}

        {/* Modals */}
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
        />

        <DocumentViewModal
          document={selectedDocumentForModal}
          open={showDocumentModal}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedDocumentForModal(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
