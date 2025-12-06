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
  showDocuments = false,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [deleteDocumentName, setDeleteDocumentName] = useState<string>("");
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

  return (
    <div className="select-none">
      {/* Folder Row */}
      <div
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors ${
          isSelected ? "bg-accent" : ""
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
          <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
        )}

        {/* Folder Name */}
        <span className="text-sm font-medium truncate flex-1">
          {folder.name}
        </span>

        {/* Document Count */}
        {showDocuments && folder.documents && folder.documents.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {folder.documents.length}
          </span>
        )}

        {/* Add Subfolder Button (visible on hover) */}
        {onFolderCreate && (
          <button
            onClick={handleCreateSubfolder}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-opacity"
            title="Create subfolder"
          >
            <Plus className="h-3.5 w-3.5 text-black" />
          </button>
        )}
      </div>

      {/* Child Folders */}
      {isExpanded && hasChildren && (
        <div className="mt-0.5">
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
              showDocuments={showDocuments}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Documents in Folder */}
      {isExpanded && showDocuments && hasDocuments && (
        <div className="mt-0.5">
          {folder.documents!.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center gap-2 px-2 py-1 rounded-md hover:text-foreground transition-colors cursor-pointer ${
                selectedDocumentId === doc.id
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
              style={{ paddingLeft: `${(level + 1) * 16 + 28}px` }}
              onClick={() => onDocumentSelect?.(doc)}
              title="Click to view"
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs truncate flex-1">{doc.name}</span>
              <span className="text-xs text-muted-foreground">
                {doc.fileType?.toUpperCase()}
              </span>

              {/* Edit and Delete Icons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              className="bg-red-600 hover:bg-red-700"
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
  onDocumentEdit,
  onDocumentDelete,
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
      {/* Root Level (All Documents) */}
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors ${
          selectedFolderId === null ? "bg-accent" : ""
        }`}
        onClick={() => onFolderSelect(null)}
      >
        <Folder className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm font-medium">All Documents</span>
      </div>

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
          showDocuments={showDocuments}
          level={0}
        />
      ))}
    </div>
  );
};

export default FolderTreeView;
