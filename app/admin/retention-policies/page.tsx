"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Archive,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useRetentionPolicies } from "@/lib/hooks/useRetentionPolicies";
import type { CreateRetentionPolicyRequest, UpdateRetentionPolicyRequest, RetentionPolicyDto } from "@/types/bms";

export default function RetentionPoliciesAdminPage() {
  const {
    retentionPolicies,
    loading,
    loadRetentionPolicies,
    createRetentionPolicy,
    updateRetentionPolicy,
    deleteRetentionPolicy,
  } = useRetentionPolicies();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicyDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    retentionPeriodDays: 365,
    action: "archive" as "archive" | "delete" | "review",
    triggerOn: "created" as "created" | "modified" | "approved",
  });

  useEffect(() => {
    loadRetentionPolicies();
  }, [loadRetentionPolicies]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      retentionPeriodDays: 365,
      action: "archive",
      triggerOn: "created",
    });
    setEditingPolicy(null);
  };

  const handleEdit = (policy: RetentionPolicyDto) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name || "",
      code: policy.code || "",
      description: policy.description || "",
      retentionPeriodDays: policy.retentionPeriodDays || 365,
      action: (policy.action as "archive" | "delete" | "review") || "archive",
      triggerOn: (policy.triggerOn as "created" | "modified" | "approved") || "created",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingPolicy) {
        const request: UpdateRetentionPolicyRequest = {
          name: formData.name,
          description: formData.description || undefined,
          retentionPeriodDays: formData.retentionPeriodDays,
          action: formData.action,
          triggerOn: formData.triggerOn,
        };
        await updateRetentionPolicy(editingPolicy.id!, request);
      } else {
        const request: CreateRetentionPolicyRequest = {
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          retentionPeriodDays: formData.retentionPeriodDays,
          action: formData.action,
          triggerOn: formData.triggerOn,
        };
        await createRetentionPolicy(request);
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

  const formatRetentionPeriod = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? "s" : ""}`;
    }
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return `${days} days`;
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
              <h1 className="text-2xl font-bold">Retention Policies</h1>
              <p className="text-gray-600">
                Configure document retention and lifecycle policies
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </div>

        {/* Retention Policies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Retention Policies ({retentionPolicies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : retentionPolicies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No retention policies configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Retention Period</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retentionPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-mono font-medium">
                        {policy.code}
                      </TableCell>
                      <TableCell>{policy.name}</TableCell>
                      <TableCell>
                        {formatRetentionPeriod(policy.retentionPeriodDays || 365)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            policy.action === "delete"
                              ? "bg-red-100 text-red-800"
                              : policy.action === "archive"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {policy.action || "archive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(policy)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => policy.id && handleDelete(policy.id)}
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
                {editingPolicy ? "Edit Retention Policy" : "Create Retention Policy"}
              </DialogTitle>
              <DialogDescription>
                {editingPolicy
                  ? "Update the retention policy configuration"
                  : "Define a new retention policy for document lifecycle management"}
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
                    placeholder="e.g., Financial Records"
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
                    placeholder="e.g., FIN-7Y"
                    disabled={!!editingPolicy}
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
                  placeholder="Describe this retention policy..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="days">Retention Period (Days)</Label>
                  <Input
                    id="days"
                    type="number"
                    value={formData.retentionPeriodDays}
                    onChange={(e) =>
                      setFormData({ ...formData, retentionPeriodDays: parseInt(e.target.value) || 365 })
                    }
                    min={1}
                  />
                  <p className="text-xs text-gray-500">
                    {formatRetentionPeriod(formData.retentionPeriodDays)}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Trigger On</Label>
                  <Select
                    value={formData.triggerOn}
                    onValueChange={(value: "created" | "modified" | "approved") =>
                      setFormData({ ...formData, triggerOn: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Document Created</SelectItem>
                      <SelectItem value="modified">Last Modified</SelectItem>
                      <SelectItem value="approved">Approved Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Action After Expiry</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value: "archive" | "delete" | "review") =>
                    setFormData({ ...formData, action: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="archive">Archive</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    {editingPolicy ? "Updating..." : "Creating..."}
                  </>
                ) : editingPolicy ? (
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
          title="Delete Retention Policy"
          description="Are you sure you want to delete this retention policy? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
          icon={Trash2}
          onConfirm={async () => {
            if (confirmDeleteId) await deleteRetentionPolicy(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
