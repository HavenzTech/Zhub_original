"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
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
  showDocuments = false,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState(false);
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

  const getStatusBadge = (status?: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "approved":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
            Rejected
          </span>
        );
      case "draft":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="select-none space-y-0.5">
      {/* Folder Row */}
      <div
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? "bg-accent-cyan/10 text-accent-cyan"
            : "hover:bg-stone-100 dark:hover:bg-stone-800"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren || hasDocuments ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            )}
          </button>
        ) : (
          <div className="w-[18px]" />
        )}

        {/* Folder Icon */}
        {isExpanded ? (
          <FolderOpen className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-accent-cyan" : "text-stone-500 dark:text-stone-400"}`} />
        ) : (
          <Folder className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-accent-cyan" : "text-stone-500 dark:text-stone-400"}`} />
        )}

        {/* Folder Name */}
        <span className={`text-[13px] font-medium truncate flex-1 ${
          isSelected ? "text-accent-cyan" : "text-stone-900 dark:text-stone-50"
        }`}>
          {folder.name}
        </span>

        {/* Document Count */}
        {showDocuments && folder.documents && folder.documents.length > 0 && (
          <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">
            {folder.documents.length}
          </span>
        )}

        {/* Add Subfolder Button (visible on hover) */}
        {onFolderCreate && (
          <button
            onClick={handleCreateSubfolder}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 rounded transition-opacity"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}

        {/* Delete Folder Button (visible on hover) */}
        {onFolderDelete && folder.id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteFolderConfirm(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-opacity"
            title="Delete folder"
          >
            <Trash2 className="h-3 w-3 text-red-500 dark:text-red-400" />
          </button>
        )}
      </div>

      {/* Documents in Folder */}
      {isExpanded && showDocuments && hasDocuments && (
        <div className="space-y-0.5">
          {folder.documents!.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedDocumentId === doc.id
                  ? "bg-accent-cyan/10"
                  : "hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
              style={{ paddingLeft: `${(level + 1) * 16 + 28}px` }}
              onClick={() => onDocumentSelect?.(doc)}
              title="Click to view"
            >
              <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${
                selectedDocumentId === doc.id ? "text-accent-cyan" : "text-stone-400 dark:text-stone-500"
              }`} />
              <span className={`text-[13px] truncate flex-1 ${
                selectedDocumentId === doc.id
                  ? "text-accent-cyan font-medium"
                  : "text-stone-700 dark:text-stone-300"
              }`}>{doc.name}</span>

              {/* Status Badge */}
              {getStatusBadge(doc.status)}
            </div>
          ))}
        </div>
      )}

      {/* Child Folders (shown after files) */}
      {isExpanded && hasChildren && (
        <div className="space-y-0.5">
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
              showDocuments={showDocuments}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog
        open={deleteFolderConfirm}
        onOpenChange={(open) => !open && setDeleteFolderConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{folder.name}</strong> and all its contents? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFolderConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (folder.id && onFolderDelete) onFolderDelete(folder.id);
                setDeleteFolderConfirm(false);
              }}
              className="!bg-red-600 hover:!bg-red-700 !text-white focus:ring-red-600"
            >
              Delete
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
  showDocuments = false,
}) => {
  // Root folders (no parent)
  const rootFolders = folders.filter((f) => !f.parentFolderId);

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Folder className="h-12 w-12 text-stone-300 dark:text-stone-600 mb-3" />
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">No folders yet</p>
        {onFolderCreate && (
          <button
            onClick={() => onFolderCreate()}
            className="text-sm text-accent-cyan hover:underline"
          >
            Create your first folder
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
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
          showDocuments={showDocuments}
          level={0}
        />
      ))}
    </div>
  );
};

export default FolderTreeView;
