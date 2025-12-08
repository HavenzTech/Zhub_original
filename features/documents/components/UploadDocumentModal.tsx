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
import { X, Upload, Loader2 } from "lucide-react";
import { formatFileSize } from "../utils/documentHelpers";
import type { Folder } from "@/types/bms";

interface UploadFormData {
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

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isUploading: boolean;
  folders: Folder[];
  projects: any[];
  departments: any[];
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDocumentModal({
  open,
  onOpenChange,
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  isUploading,
  folders,
  projects,
  departments,
  onSubmit,
  onFileChange,
}: UploadDocumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to the system. Fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* File Upload */}
            <div className="grid gap-2">
              <Label htmlFor="file">File *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  onChange={onFileChange}
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
                      status: value,
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
                      accessLevel: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
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
                      category: value,
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
                    {Array.isArray(folders) && folders.filter(f => f.id).map((folder) => (
                      <SelectItem key={folder.id} value={folder.id!}>
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
                    {Array.isArray(projects) && projects.map((project) => (
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
                    {Array.isArray(departments) && departments.map((dept) => (
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
              <Label htmlFor="gcpFolderPath">GCP Folder Path (Optional)</Label>
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
              onClick={() => onOpenChange(false)}
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
  );
}
