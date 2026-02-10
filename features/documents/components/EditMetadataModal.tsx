"use client";

import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Save, Loader2, FileText, Trash2 } from "lucide-react";
import type { Document, Folder, DocumentCategory } from "@/types/bms";

interface EditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSave: (documentId: string, updates: Partial<Document>) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  folders?: Folder[];
  projects?: any[];
  departments?: any[];
  properties?: any[];
}

const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  isOpen,
  onClose,
  document,
  onSave,
  onDelete,
  folders = [],
  projects = [],
  departments = [],
  properties = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "" as DocumentCategory | "",
    tags: "",
    accessLevel: "private" as string,
    folderId: "" as string,
    projectId: "" as string,
    departmentId: "" as string,
    propertyId: "" as string,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (document) {
      // Parse tags - can be a JSON string array, plain string, or null
      let tagsString = "";
      const tags = document.tags as unknown;
      if (tags) {
        if (typeof tags === "string") {
          try {
            const parsedTags = JSON.parse(tags);
            if (Array.isArray(parsedTags)) {
              tagsString = parsedTags.join(", ");
            } else {
              tagsString = tags;
            }
          } catch {
            // Not valid JSON, use as-is
            tagsString = tags;
          }
        } else if (Array.isArray(tags)) {
          tagsString = tags.join(", ");
        }
      }

      setFormData({
        name: document.name || "",
        category: (document.category as DocumentCategory) || "",
        tags: tagsString,
        accessLevel: document.accessLevel || "private",
        folderId: document.folderId || "",
        projectId: document.projectId || "",
        departmentId: document.departmentId || "",
        propertyId: document.propertyId || "",
      });
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!document?.id || !formData.name.trim()) {
      setError("Document name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<Document> = {
        name: formData.name.trim(),
        category: formData.category || undefined,
        accessLevel: formData.accessLevel,
        folderId: formData.folderId || null,
        projectId: formData.projectId || null,
        departmentId: formData.departmentId || null,
        propertyId: formData.propertyId || null,
      };

      // Convert tags to JSON string array for backend
      if (formData.tags?.trim()) {
        const tagsArray = formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
        updates.tags = JSON.stringify(tagsArray);
      } else {
        updates.tags = null;
      }

      await onSave(document.id, updates);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update metadata");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError("");
      onClose();
    }
  };

  // Flatten folder tree for dropdown
  const flattenFolders = (folderList: Folder[], prefix = ""): { id: string; displayName: string }[] => {
    if (!Array.isArray(folderList)) return [];
    const result: { id: string; displayName: string }[] = [];
    for (const folder of folderList) {
      if (folder.id) {
        const displayName = prefix ? `${prefix} / ${folder.name}` : folder.name || "";
        result.push({ id: folder.id, displayName });
        if (folder.childFolders && folder.childFolders.length > 0) {
          result.push(...flattenFolders(folder.childFolders, displayName));
        }
      }
    }
    return result;
  };
  const flatFolders = flattenFolders(folders);

  if (!isOpen || !document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Document Metadata
          </DialogTitle>
          <DialogDescription>
            Update the document properties and associations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Document Name */}
            <div className="grid gap-2">
              <Label htmlFor="docName">Document Name *</Label>
              <Input
                id="docName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter document name"
                maxLength={500}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Category and Access Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as DocumentCategory | "",
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label>Access Level</Label>
                <RadioGroup
                  value={formData.accessLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, accessLevel: value })
                  }
                  className="flex items-center gap-4 h-10"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="edit-private" />
                    <Label htmlFor="edit-private" className="font-normal cursor-pointer">
                      Private
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="edit-public" />
                    <Label htmlFor="edit-public" className="font-normal cursor-pointer">
                      Public
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restricted" id="edit-restricted" />
                    <Label htmlFor="edit-restricted" className="font-normal cursor-pointer">
                      Restricted
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Folder and Project */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="folder">Folder</Label>
                <Select
                  value={formData.folderId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      folderId: value === "none" ? "" : value,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {flatFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      projectId: value === "none" ? "" : value,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(projects) &&
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department and Property */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      departmentId: value === "none" ? "" : value,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(departments) &&
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="property">Property</Label>
                <Select
                  value={formData.propertyId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      propertyId: value === "none" ? "" : value,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(properties) &&
                      properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
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
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* File Info (Read-only) */}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">File Information</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <strong>Type:</strong>{" "}
                  {document.fileType?.toUpperCase() || "Unknown"}
                </div>
                <div>
                  <strong>Size:</strong>{" "}
                  {document.fileSizeBytes
                    ? `${(document.fileSizeBytes / 1024).toFixed(2)} KB`
                    : "N/A"}
                </div>
                <div>
                  <strong>Uploaded:</strong>{" "}
                  {document.createdAt
                    ? new Date(document.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* Delete Document */}
            {onDelete && document.id && (
              <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Document
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{document.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="!bg-red-600 hover:!bg-red-700 !text-white focus:ring-red-600"
                disabled={isDeleting}
                onClick={async () => {
                  if (!document.id || !onDelete) return;
                  setIsDeleting(true);
                  try {
                    await onDelete(document.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  } catch {
                    setError("Failed to delete document");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default EditMetadataModal;
