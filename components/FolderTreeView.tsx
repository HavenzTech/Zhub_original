'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Plus } from 'lucide-react';
import type { Folder as FolderType, Document } from '@/types/bms';

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
  level
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.childFolders && folder.childFolders.length > 0;
  const hasDocuments = showDocuments && folder.documents && folder.documents.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onSelect(folder.id);
  };

  const handleCreateSubfolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFolderCreate) {
      onFolderCreate(folder.id);
    }
  };

  const handleFolderContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFolderDelete) {
      if (confirm(`Delete folder "${folder.name}"?\n\nThis will also delete all subfolders and documents inside it.`)) {
        onFolderDelete(folder.id);
      }
    }
  };

  const handleDocumentContextMenu = (e: React.MouseEvent, docId: string, docName: string) => {
    e.preventDefault();
    e.stopPropagation();

    const action = confirm(`Choose action for "${docName}":\n\nOK = Edit Metadata\nCancel = Delete Document`);
    if (action) {
      if (onDocumentEdit) onDocumentEdit(docId);
    } else {
      if (onDocumentDelete && confirm(`Delete document "${docName}"?`)) {
        onDocumentDelete(docId);
      }
    }
  };

  return (
    <div className="select-none">
      {/* Folder Row */}
      <div
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors ${
          isSelected ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
        onContextMenu={handleFolderContextMenu}
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
        <span className="text-sm font-medium truncate flex-1">{folder.name}</span>

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
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent-foreground/10 rounded transition-opacity"
            title="Create subfolder"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
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
              className={`flex items-center gap-2 px-2 py-1 rounded-md hover:text-foreground transition-colors cursor-pointer ${
                selectedDocumentId === doc.id
                  ? 'bg-blue-100 text-blue-900 font-medium'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
              style={{ paddingLeft: `${(level + 1) * 16 + 28}px` }}
              onClick={() => onDocumentSelect?.(doc)}
              onContextMenu={(e) => handleDocumentContextMenu(e, doc.id, doc.name)}
              title="Click to view, right-click for options"
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs truncate flex-1">{doc.name}</span>
              <span className="text-xs text-muted-foreground">
                {doc.fileType?.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
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
  showDocuments = false
}) => {
  // Root folders (no parent)
  const rootFolders = folders.filter(f => !f.parentFolderId);

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
          selectedFolderId === null ? 'bg-accent' : ''
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
