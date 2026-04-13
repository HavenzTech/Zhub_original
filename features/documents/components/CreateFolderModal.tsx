"use client";

import React, { useState, useEffect } from "react";
import { X, Folder, FolderTree, ChevronRight } from "lucide-react";
import { bmsApi } from "@/lib/services/bmsApi";
import type { FolderTemplateDto, FolderStructureItem } from "@/types/bms";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    description?: string,
    parentFolderId?: string,
    templateId?: string,
    projectId?: string
  ) => Promise<void>;
  parentFolderId?: string;
  parentFolderName?: string;
  /** List of projects for the optional project dropdown */
  projects?: { id: string; name: string }[];
  /** When set, locks the project selector to this project */
  lockedProjectId?: string | null;
}

// Helper to render template preview
function TemplatePreview({ items, depth = 0 }: { items: FolderStructureItem[]; depth?: number }) {
  return (
    <div className={depth > 0 ? "ml-4" : ""}>
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-center gap-1 text-xs text-gray-600 py-0.5">
            <ChevronRight className="w-3 h-3" />
            <Folder className="w-3 h-3 text-amber-500" />
            <span>{item.name}</span>
          </div>
          {item.children && item.children.length > 0 && (
            <TemplatePreview items={item.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentFolderId,
  parentFolderName,
  projects,
  lockedProjectId,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<FolderTemplateDto[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Initialize project selection when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (lockedProjectId) {
        setSelectedProjectId(lockedProjectId);
      }
    }
  }, [isOpen, lockedProjectId]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await bmsApi.admin.folderTemplates.list();
      // Filter to only active templates
      const activeTemplates = (data || []).filter((t: FolderTemplateDto) => t.isActive !== false);
      setTemplates(activeTemplates);
    } catch (err) {
      console.error("Failed to load folder templates:", err);
      // Don't show error - templates are optional
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        name.trim(),
        description.trim() || undefined,
        parentFolderId,
        selectedTemplateId || undefined,
        selectedProjectId || undefined
      );
      // Reset form
      setName("");
      setDescription("");
      setSelectedTemplateId("");
      setSelectedProjectId("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setDescription("");
      setSelectedTemplateId("");
      setSelectedProjectId("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  const lockedProject = lockedProjectId && projects
    ? projects.find((p) => p.id === lockedProjectId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">
              {parentFolderId ? "Create Subfolder" : "Create Folder"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Parent Folder Info */}
          {parentFolderId && parentFolderName && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              Creating subfolder in:{" "}
              <span className="font-medium">{parentFolderName}</span>
            </div>
          )}

          {/* Folder Name */}
          <div>
            <label
              htmlFor="folderName"
              className="block text-sm font-medium mb-1"
            >
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              id="folderName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              maxLength={255}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label
              htmlFor="folderDescription"
              className="block text-sm font-medium mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="folderDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter folder description"
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Project (Optional or Locked) */}
          {projects && projects.length > 0 && (
            <div>
              <label
                htmlFor="folderProject"
                className="block text-sm font-medium mb-1"
              >
                Project
              </label>
              {lockedProject ? (
                <div className="w-full px-3 py-2 border rounded-md bg-muted text-sm text-muted-foreground">
                  {lockedProject.name}
                </div>
              ) : (
                <select
                  id="folderProject"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isSubmitting}
                >
                  <option value="">None</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Tie this folder to a project so it appears in the project&apos;s document view.
              </p>
            </div>
          )}

          {/* Folder Template (Optional) */}
          {templates.length > 0 && (
            <div>
              <label
                htmlFor="folderTemplate"
                className="block text-sm font-medium mb-1"
              >
                <div className="flex items-center gap-1">
                  <FolderTree className="w-4 h-4" />
                  Apply Template (Optional)
                </div>
              </label>
              <select
                id="folderTemplate"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                disabled={isSubmitting || loadingTemplates}
              >
                <option value="">No template - create empty folder</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Templates automatically create subfolders with predefined structure
              </p>

              {/* Template Preview */}
              {selectedTemplate && selectedTemplate.structure?.folders && selectedTemplate.structure.folders.length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <p className="text-xs font-medium text-gray-700 mb-1">Structure Preview:</p>
                  <TemplatePreview items={selectedTemplate.structure.folders} />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
