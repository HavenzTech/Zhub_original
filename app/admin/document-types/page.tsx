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
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDocumentTypes } from "@/lib/hooks/useDocumentTypes";
import type { DocumentTypeDto, CreateDocumentTypeRequest, UpdateDocumentTypeRequest } from "@/types/bms";

export default function DocumentTypesAdminPage() {
  const {
    documentTypes,
    loading,
    loadDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
  } = useDocumentTypes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<DocumentTypeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    allowedExtensions: "",
    autoNumberPrefix: "",
    autoNumberDigits: 4,
    autoNumberIncludesYear: true,
    autoNumberEnabled: false,
    requiresApproval: false,
    isActive: true,
  });

  useEffect(() => {
    loadDocumentTypes();
  }, [loadDocumentTypes]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      allowedExtensions: "",
      autoNumberPrefix: "",
      autoNumberDigits: 4,
      autoNumberIncludesYear: true,
      autoNumberEnabled: false,
      requiresApproval: false,
      isActive: true,
    });
    setEditingType(null);
  };

  const handleEdit = (type: DocumentTypeDto) => {
    setEditingType(type);
    setFormData({
      name: type.name || "",
      code: type.code || "",
      description: type.description || "",
      allowedExtensions: type.allowedExtensions?.join(", ") || "",
      autoNumberPrefix: type.autoNumberPrefix || "",
      autoNumberDigits: type.autoNumberDigits || 4,
      autoNumberIncludesYear: type.autoNumberIncludesYear !== false,
      autoNumberEnabled: type.autoNumberEnabled || false,
      requiresApproval: type.requiresApproval || false,
      isActive: type.isActive !== false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const extensions = formData.allowedExtensions
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);

      if (editingType) {
        const request: UpdateDocumentTypeRequest = {
          name: formData.name,
          description: formData.description || undefined,
          allowedExtensions: extensions.length > 0 ? extensions : undefined,
          autoNumberEnabled: formData.autoNumberEnabled,
          autoNumberPrefix: formData.autoNumberPrefix || undefined,
          autoNumberDigits: formData.autoNumberDigits,
          autoNumberIncludesYear: formData.autoNumberIncludesYear,
          requiresApproval: formData.requiresApproval,
          isActive: formData.isActive,
        };
        await updateDocumentType(editingType.id!, request);
      } else {
        const request: CreateDocumentTypeRequest = {
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          allowedExtensions: extensions.length > 0 ? extensions : undefined,
          autoNumberEnabled: formData.autoNumberEnabled,
          autoNumberPrefix: formData.autoNumberPrefix || undefined,
          autoNumberDigits: formData.autoNumberDigits,
          autoNumberIncludesYear: formData.autoNumberIncludesYear,
          requiresApproval: formData.requiresApproval,
        };
        await createDocumentType(request);
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
              <h1 className="text-2xl font-bold">Document Types</h1>
              <p className="text-gray-600">
                Configure document type definitions for your organization
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document Type
          </Button>
        </div>

        {/* Document Types Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Types ({documentTypes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : documentTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No document types configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Allowed Extensions</TableHead>
                    <TableHead>Number Format</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono font-medium">
                        {type.code}
                      </TableCell>
                      <TableCell>{type.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {type.allowedExtensions?.slice(0, 3).map((ext) => (
                            <Badge key={ext} variant="secondary" className="text-xs">
                              .{ext}
                            </Badge>
                          ))}
                          {type.allowedExtensions && type.allowedExtensions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{type.allowedExtensions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {type.autoNumberEnabled && type.autoNumberPrefix
                          ? `${type.autoNumberPrefix}-${'0'.repeat(type.autoNumberDigits || 4)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={type.requiresApproval ? "default" : "secondary"}
                          className={type.requiresApproval ? "bg-blue-100 text-blue-800" : ""}
                        >
                          {type.requiresApproval ? "Required" : "None"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={type.isActive ? "default" : "secondary"}
                          className={type.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => type.id && handleDelete(type.id)}
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Edit Document Type" : "Create Document Type"}
              </DialogTitle>
              <DialogDescription>
                {editingType
                  ? "Update the document type configuration"
                  : "Define a new document type for your organization"}
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
                    placeholder="e.g., Contract"
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
                    placeholder="e.g., CON"
                    disabled={!!editingType}
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
                  placeholder="Describe this document type..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="extensions">Allowed Extensions</Label>
                <Input
                  id="extensions"
                  value={formData.allowedExtensions}
                  onChange={(e) =>
                    setFormData({ ...formData, allowedExtensions: e.target.value })
                  }
                  placeholder="pdf, docx, xlsx (comma-separated)"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Numbering</Label>
                  <div className="text-xs text-gray-500">
                    Automatically generate document numbers
                  </div>
                </div>
                <Switch
                  checked={formData.autoNumberEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoNumberEnabled: checked })
                  }
                />
              </div>

              {formData.autoNumberEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prefix">Number Prefix</Label>
                    <Input
                      id="prefix"
                      value={formData.autoNumberPrefix}
                      onChange={(e) =>
                        setFormData({ ...formData, autoNumberPrefix: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., CON"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="digits">Number Digits</Label>
                    <Input
                      id="digits"
                      type="number"
                      value={formData.autoNumberDigits}
                      onChange={(e) =>
                        setFormData({ ...formData, autoNumberDigits: parseInt(e.target.value) || 4 })
                      }
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              )}

              {formData.autoNumberEnabled && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Year</Label>
                    <div className="text-xs text-gray-500">
                      Add year prefix to document numbers (e.g., 2024-0001)
                    </div>
                  </div>
                  <Switch
                    checked={formData.autoNumberIncludesYear}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, autoNumberIncludesYear: checked })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requires Approval</Label>
                  <div className="text-xs text-gray-500">
                    Documents must go through workflow approval
                  </div>
                </div>
                <Switch
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requiresApproval: checked })
                  }
                />
              </div>

              {editingType && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <div className="text-xs text-gray-500">
                      Inactive types cannot be used for new documents
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
                    {editingType ? "Updating..." : "Creating..."}
                  </>
                ) : editingType ? (
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
          title="Delete Document Type"
          description="Are you sure you want to delete this document type? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
          icon={Trash2}
          onConfirm={async () => {
            if (confirmDeleteId) await deleteDocumentType(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
