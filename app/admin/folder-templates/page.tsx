"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Loader2,
  ArrowLeft,
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useFolderTemplates } from "@/lib/hooks/useFolderTemplates";
import type { FolderTemplateDto, CreateFolderTemplateRequest, UpdateFolderTemplateRequest, FolderTemplateStructure, FolderStructureItem } from "@/types/bms";

// Folder Structure Editor Component
interface FolderItemEditorProps {
  item: FolderStructureItem;
  onUpdate: (item: FolderStructureItem) => void;
  onDelete: () => void;
  depth?: number;
}

function FolderItemEditor({ item, onUpdate, onDelete, depth = 0 }: FolderItemEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  const addChild = () => {
    const newChild: FolderStructureItem = { name: "New Folder", children: [] };
    onUpdate({
      ...item,
      children: [...(item.children || []), newChild],
    });
  };

  const updateChild = (index: number, updatedChild: FolderStructureItem) => {
    const newChildren = [...(item.children || [])];
    newChildren[index] = updatedChild;
    onUpdate({ ...item, children: newChildren });
  };

  const deleteChild = (index: number) => {
    const newChildren = (item.children || []).filter((_, i) => i !== index);
    onUpdate({ ...item, children: newChildren });
  };

  return (
    <div className={`${depth > 0 ? "ml-6 border-l border-gray-200 pl-3" : ""}`}>
      <div className="flex items-center gap-2 py-1.5 group">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        <Folder className="w-4 h-4 text-amber-500" />
        <Input
          value={item.name || ""}
          onChange={(e) => onUpdate({ ...item, name: e.target.value })}
          className="h-7 text-sm flex-1 max-w-[200px]"
          placeholder="Folder name"
        />
        <Select
          value={item.classification || "none"}
          onValueChange={(value) => onUpdate({ ...item, classification: value === "none" ? null : value })}
        >
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No class</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="confidential">Confidential</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
          onClick={addChild}
          title="Add subfolder"
        >
          <FolderPlus className="w-4 h-4 text-gray-500" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:text-red-600"
          onClick={onDelete}
          title="Delete folder"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {expanded && hasChildren && (
        <div>
          {item.children!.map((child, index) => (
            <FolderItemEditor
              key={index}
              item={child}
              onUpdate={(updated) => updateChild(index, updated)}
              onDelete={() => deleteChild(index)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FolderStructureEditorProps {
  structure: FolderTemplateStructure;
  onChange: (structure: FolderTemplateStructure) => void;
}

function FolderStructureEditor({ structure, onChange }: FolderStructureEditorProps) {
  const folders = structure.folders || [];

  const addRootFolder = () => {
    const newFolder: FolderStructureItem = { name: "New Folder", children: [] };
    onChange({ folders: [...folders, newFolder] });
  };

  const updateFolder = (index: number, updatedFolder: FolderStructureItem) => {
    const newFolders = [...folders];
    newFolders[index] = updatedFolder;
    onChange({ folders: newFolders });
  };

  const deleteFolder = (index: number) => {
    const newFolders = folders.filter((_, i) => i !== index);
    onChange({ folders: newFolders });
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Folder Structure</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={addRootFolder}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Folder
        </Button>
      </div>
      {folders.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No folders defined. Click "Add Folder" to start building the structure.
        </div>
      ) : (
        <div className="bg-white rounded border p-2 max-h-[250px] overflow-y-auto">
          {folders.map((folder, index) => (
            <FolderItemEditor
              key={index}
              item={folder}
              onUpdate={(updated) => updateFolder(index, updated)}
              onDelete={() => deleteFolder(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTemplatesAdminPage() {
  const {
    folderTemplates,
    loading,
    loadFolderTemplates,
    createFolderTemplate,
    updateFolderTemplate,
    deleteFolderTemplate,
  } = useFolderTemplates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FolderTemplateDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    appliesToScope: "project" as string,
    structure: { folders: [] } as FolderTemplateStructure,
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    loadFolderTemplates();
  }, [loadFolderTemplates]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      appliesToScope: "project",
      structure: { folders: [] },
      isDefault: false,
      isActive: true,
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: FolderTemplateDto) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || "",
      code: template.code || "",
      description: template.description || "",
      appliesToScope: template.appliesToScope || "project",
      structure: template.structure || { folders: [] },
      isDefault: template.isDefault || false,
      isActive: template.isActive !== false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        const request: UpdateFolderTemplateRequest = {
          name: formData.name,
          description: formData.description || undefined,
          structure: formData.structure,
          appliesToScope: formData.appliesToScope || undefined,
          isDefault: formData.isDefault,
          isActive: formData.isActive,
        };
        await updateFolderTemplate(editingTemplate.id!, request);
      } else {
        const request: CreateFolderTemplateRequest = {
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          structure: formData.structure,
          appliesToScope: formData.appliesToScope || undefined,
          isDefault: formData.isDefault,
        };
        await createFolderTemplate(request);
      }
      setDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const getScopeLabel = (scope?: string | null) => {
    switch (scope) {
      case "company":
        return "Company";
      case "property":
        return "Property";
      case "tenant":
        return "Tenant";
      case "department":
        return "Department";
      case "project":
        return "Project";
      case "area":
        return "Area";
      case "personal":
        return "Personal";
      default:
        return scope || "Unknown";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/document-control">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Folder Templates</h1>
              <p className="text-gray-600">
                Configure folder structure templates for projects and departments
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>

        {/* Folder Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              Folder Templates ({folderTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : folderTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No folder templates configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folderTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-mono font-medium">
                        {template.code}
                      </TableCell>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getScopeLabel(template.appliesToScope)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={template.isActive ? "default" : "secondary"}
                          className={template.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => template.id && handleDelete(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Folder Template" : "Create Folder Template"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate
                  ? "Update the folder template configuration"
                  : "Define a new folder template structure"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Standard Project"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., STD-PROJ"
                    disabled={!!editingTemplate}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this folder template..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label>Applies To Scope</Label>
                <Select
                  value={formData.appliesToScope}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, appliesToScope: value })
                  }
                  disabled={!!editingTemplate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Set as Default</Label>
                  <div className="text-xs text-gray-500">
                    Auto-apply when creating new {formData.appliesToScope} folders
                  </div>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked })
                  }
                />
              </div>

              {editingTemplate && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <div className="text-xs text-gray-500">
                      Inactive templates cannot be applied
                    </div>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              )}

              <FolderStructureEditor
                structure={formData.structure}
                onChange={(structure) => setFormData({ ...formData, structure })}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.code}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingTemplate ? "Updating..." : "Creating..."}
                  </>
                ) : editingTemplate ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={!!confirmDeleteId}
          onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
          title="Delete Folder Template"
          description="Are you sure you want to delete this folder template? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
          icon={Trash2}
          onConfirm={async () => {
            if (confirmDeleteId) await deleteFolderTemplate(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
