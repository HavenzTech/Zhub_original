import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2, Plus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFileSize } from "../utils/documentHelpers";
import type { Folder } from "@/types/bms";

export interface UserAccess {
  userId: string;
  userName: string;
  accessLevel: "view" | "edit";
}

export interface UploadFormData {
  name: string;
  status: string;
  accessLevel: string;
  category: string;
  tags: string;
  folderId: string | null;
  projectId: string | null;
  propertyId: string | null;
  departmentIds: string[];
  userAccess: UserAccess[];
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
  properties: any[];
  users: any[];
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
  properties,
  users,
  onSubmit,
  onFileChange,
}: UploadDocumentModalProps) {
  const [selectedDeptToAdd, setSelectedDeptToAdd] = useState<string>("");
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");
  const [selectedUserAccessLevel, setSelectedUserAccessLevel] = useState<"view" | "edit">("view");

  const handleAddDepartment = () => {
    if (selectedDeptToAdd && !formData.departmentIds.includes(selectedDeptToAdd)) {
      setFormData({
        ...formData,
        departmentIds: [...formData.departmentIds, selectedDeptToAdd],
      });
      setSelectedDeptToAdd("");
    }
  };

  const handleRemoveDepartment = (deptId: string) => {
    setFormData({
      ...formData,
      departmentIds: formData.departmentIds.filter((id) => id !== deptId),
    });
  };

  const handleAddUser = () => {
    if (selectedUserToAdd && !formData.userAccess.find((u) => u.userId === selectedUserToAdd)) {
      const usersList = Array.isArray(users) ? users : [];
      const user = usersList.find((u: any) => u.id === selectedUserToAdd);
      if (user) {
        setFormData({
          ...formData,
          userAccess: [
            ...formData.userAccess,
            {
              userId: selectedUserToAdd,
              userName: user.name || user.email || "Unknown",
              accessLevel: selectedUserAccessLevel,
            },
          ],
        });
        setSelectedUserToAdd("");
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    setFormData({
      ...formData,
      userAccess: formData.userAccess.filter((u) => u.userId !== userId),
    });
  };

  const getDepartmentName = (deptId: string) => {
    if (!Array.isArray(departments)) return deptId;
    const dept = departments.find((d: any) => d.id === deptId);
    return dept?.name || deptId;
  };

  // Filter out already selected departments and users (with safety checks)
  const availableDepartments = Array.isArray(departments)
    ? departments.filter((d: any) => !formData.departmentIds.includes(d.id))
    : [];
  const availableUsers = Array.isArray(users)
    ? users.filter((u: any) => !formData.userAccess.find((ua) => ua.userId === u.id))
    : [];

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

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
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
            </div>

            {/* Folder and Project */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="folder">Folder *</Label>
                <Select
                  value={formData.folderId || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      folderId: value || null,
                    })
                  }
                >
                  <SelectTrigger className={!formData.folderId ? "border-orange-300" : ""}>
                    <SelectValue placeholder="Select a folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    {flatFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.folderId && (
                  <p className="text-xs text-orange-600">
                    A folder must be selected to upload
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
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

            {/* Property */}
            <div className="grid gap-2">
              <Label htmlFor="property">Property</Label>
              <Select
                value={formData.propertyId || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    propertyId: value === "none" ? null : value,
                  })
                }
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

            {/* Departments - Multi-select */}
            <div className="grid gap-2">
              <Label>Departments</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedDeptToAdd}
                  onValueChange={setSelectedDeptToAdd}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDepartment}
                  disabled={!selectedDeptToAdd}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {formData.departmentIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.departmentIds.map((deptId) => (
                    <Badge
                      key={deptId}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {getDepartmentName(deptId)}
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(deptId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Users - Multi-select with access level */}
            <div className="grid gap-2">
              <Label>Users</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedUserToAdd}
                  onValueChange={setSelectedUserToAdd}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedUserAccessLevel}
                  onValueChange={(value: "view" | "edit") =>
                    setSelectedUserAccessLevel(value)
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddUser}
                  disabled={!selectedUserToAdd}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {formData.userAccess.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.userAccess.map((user) => (
                    <Badge
                      key={user.userId}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {user.userName}
                      <span className="text-xs text-gray-500">
                        ({user.accessLevel})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.userId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Access Level - Radio buttons */}
            <div className="grid gap-2">
              <Label>Access</Label>
              <RadioGroup
                value={formData.accessLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, accessLevel: value })
                }
                className="flex items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="font-normal cursor-pointer">
                    Private
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="font-normal cursor-pointer">
                    Public
                  </Label>
                </div>
              </RadioGroup>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      type="submit"
                      disabled={isUploading || !formData.folderId}
                      className={!formData.folderId ? "pointer-events-none" : ""}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!formData.folderId && (
                  <TooltipContent>
                    <p>Select a folder to upload to</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
