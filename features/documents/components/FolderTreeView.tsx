"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Folder as FolderType, Document } from "@/types/bms";
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

interface FolderTreeViewProps {
  folders: FolderType[];
  selectedFolderId?: string | null;
  selectedDocumentId?: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onDocumentSelect?: (document: Document) => void;
  onFolderCreate?: (parentFolderId?: string) => void;
  onFolderDelete?: (folderId: string) => void;
  onDocumentEdit?: (documentId: string) => void;
  onDocumentDelete?: (documentId: string) => void;
  onDocumentApprove?: (documentId: string) => void;
  onDocumentReject?: (documentId: string, reason?: string) => void;
  showDocuments?: boolean;
}

interface FolderNodeProps {
  folder: FolderType;
  selectedFolderId?: string | null;
  selectedDocumentId?: string | null;
  onSelect: (folderId: string) => void;
  onDocumentSelect?: (document: Document) => void;
  onFolderCreate?: (parentFolderId: string) => void;
  onFolderDelete?: (folderId: string) => void;
  onDocumentEdit?: (documentId: string) => void;
  onDocumentDelete?: (documentId: string) => void;
  onDocumentApprove?: (documentId: string) => void;
  onDocumentReject?: (documentId: string, reason?: string) => void;
  showDocuments?: boolean;
  level: number;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  selectedFolderId,
  selectedDocumentId,
  onSelect,
  onDocumentSelect,
  onFolderCreate,
  onFolderDelete,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentApprove,
  onDocumentReject,
  showDocuments = false,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [deleteDocumentName, setDeleteDocumentName] = useState<string>("");
  const [rejectDocumentId, setRejectDocumentId] = useState<string | null>(null);
  const [rejectDocumentName, setRejectDocumentName] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.childFolders && folder.childFolders.length > 0;
  const hasDocuments =
    showDocuments && folder.documents && folder.documents.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    if (folder.id) onSelect(folder.id);
  };

  const handleCreateSubfolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFolderCreate && folder.id) {
      onFolderCreate(folder.id);
    }
  };

  const handleDocumentEdit = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDocumentEdit) {
      onDocumentEdit(docId);
    }
  };

  const handleDocumentDeleteClick = (
    e: React.MouseEvent,
    docId: string,
    docName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDocumentId(docId);
    setDeleteDocumentName(docName);
  };

  const confirmDelete = () => {
    if (deleteDocumentId && onDocumentDelete) {
      onDocumentDelete(deleteDocumentId);
    }
    setDeleteDocumentId(null);
    setDeleteDocumentName("");
  };

  const cancelDelete = () => {
    setDeleteDocumentId(null);
    setDeleteDocumentName("");
  };

  const handleDocumentApprove = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDocumentApprove) {
      onDocumentApprove(docId);
    }
  };

  const handleDocumentRejectClick = (
    e: React.MouseEvent,
    docId: string,
    docName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setRejectDocumentId(docId);
    setRejectDocumentName(docName);
    setRejectionReason("");
  };

  const confirmReject = () => {
    if (rejectDocumentId && onDocumentReject) {
      onDocumentReject(rejectDocumentId, rejectionReason || undefined);
    }
    setRejectDocumentId(null);
    setRejectDocumentName("");
    setRejectionReason("");
  };

  const cancelReject = () => {
    setRejectDocumentId(null);
    setRejectDocumentName("");
    setRejectionReason("");
  };

  const getStatusBadge = (status?: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "approved":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "draft":
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  const canApproveOrReject = (status?: string) => {
    const statusLower = status?.toLowerCase();
    return statusLower === "pending" || statusLower === "draft";
  };

  return (
    <div className="select-none space-y-1">
      {/* Folder Row */}
      <div
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-200 transition-colors ${
          isSelected ? "bg-accent" : "bg-gray-100"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren || hasDocuments ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-accent-foreground/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Folder Icon */}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-gray-900 flex-shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-gray-900 flex-shrink-0" />
        )}

        {/* Folder Name */}
        <span className="text-base font-medium truncate flex-1">
          {folder.name}
        </span>

        {/* Document Count */}
        {showDocuments && folder.documents && folder.documents.length > 0 && (
          <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
            {folder.documents.length} {folder.documents.length === 1 ? "File" : "Files"}
          </span>
        )}

        {/* Add Subfolder Button (visible on hover) */}
        {onFolderCreate && (
          <button
            onClick={handleCreateSubfolder}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            Subfolder
          </button>
        )}
      </div>

      {/* Documents in Folder (shown before subfolders for better readability) */}
      {isExpanded && showDocuments && hasDocuments && (
        <div className="mt-1 space-y-1">
          {folder.documents!.map((doc, index) => (
            <div
              key={doc.id}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors cursor-pointer ${
                selectedDocumentId === doc.id
                  ? "bg-gray-300 text-gray-900 font-medium border-gray-400"
                  : index % 2 === 0
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
              }`}
              style={{ paddingLeft: `${(level + 1) * 16 + 28}px` }}
              onClick={() => onDocumentSelect?.(doc)}
              title="Click to view"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate flex-1">{doc.name}</span>
              <span className="text-xs text-muted-foreground">
                {doc.fileType?.toUpperCase()}
              </span>

              {/* Status Badge */}
              {getStatusBadge(doc.status)}

              {/* Action Icons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Approve/Reject buttons - only for pending or draft documents */}
                {onDocumentApprove && doc.id && canApproveOrReject(doc.status) && (
                  <button
                    onClick={(e) => handleDocumentApprove(e, doc.id!)}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                    title="Approve document"
                  >
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </button>
                )}
                {onDocumentReject && doc.id && canApproveOrReject(doc.status) && (
                  <button
                    onClick={(e) =>
                      handleDocumentRejectClick(e, doc.id!, doc.name ?? "")
                    }
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Reject document"
                  >
                    <XCircle className="h-3 w-3 text-red-600" />
                  </button>
                )}
                {onDocumentEdit && doc.id && (
                  <button
                    onClick={(e) => handleDocumentEdit(e, doc.id!)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Edit metadata"
                  >
                    <Edit className="h-3 w-3 text-blue-600" />
                  </button>
                )}
                {onDocumentDelete && doc.id && (
                  <button
                    onClick={(e) =>
                      handleDocumentDeleteClick(e, doc.id!, doc.name ?? "")
                    }
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Child Folders (shown after files) */}
      {isExpanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {folder.childFolders!.map((childFolder) => (
            <FolderNode
              key={childFolder.id}
              folder={childFolder}
              selectedFolderId={selectedFolderId}
              selectedDocumentId={selectedDocumentId}
              onSelect={onSelect}
              onDocumentSelect={onDocumentSelect}
              onFolderCreate={onFolderCreate}
              onFolderDelete={onFolderDelete}
              onDocumentEdit={onDocumentEdit}
              onDocumentDelete={onDocumentDelete}
              onDocumentApprove={onDocumentApprove}
              onDocumentReject={onDocumentReject}
              showDocuments={showDocuments}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDocumentId}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteDocumentName}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="!bg-red-600 hover:!bg-red-700 !text-white focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog
        open={!!rejectDocumentId}
        onOpenChange={(open) => !open && cancelReject()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject{" "}
              <strong>{rejectDocumentName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-4">
            <label className="text-sm font-medium text-gray-700">
              Reason (optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelReject}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="!bg-red-600 hover:!bg-red-700 !text-white focus:ring-red-600"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const FolderTreeView: React.FC<FolderTreeViewProps> = ({
  folders,
  selectedFolderId,
  selectedDocumentId,
  onFolderSelect,
  onDocumentSelect,
  onFolderCreate,
  onFolderDelete,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentApprove,
  onDocumentReject,
  showDocuments = false,
}) => {
  // Root folders (no parent)
  const rootFolders = folders.filter((f) => !f.parentFolderId);

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Folder className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-4">No folders yet</p>
        {onFolderCreate && (
          <button
            onClick={() => onFolderCreate()}
            className="text-sm text-primary hover:underline"
          >
            Create your first folder
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Folder Tree */}
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          selectedFolderId={selectedFolderId}
          selectedDocumentId={selectedDocumentId}
          onSelect={onFolderSelect}
          onDocumentSelect={onDocumentSelect}
          onFolderCreate={onFolderCreate}
          onFolderDelete={onFolderDelete}
          onDocumentEdit={onDocumentEdit}
          onDocumentDelete={onDocumentDelete}
          onDocumentApprove={onDocumentApprove}
          onDocumentReject={onDocumentReject}
          showDocuments={showDocuments}
          level={0}
        />
      ))}
    </div>
  );
};

export default FolderTreeView;
