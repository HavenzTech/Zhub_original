"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// Card imports removed — using plain divs for new UI pattern
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
import { Plus, Edit, Trash2, Archive, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useRetentionPolicies } from "@/lib/hooks/useRetentionPolicies";
import type { CreateRetentionPolicyRequest, UpdateRetentionPolicyRequest, RetentionPolicyDto } from "@/types/bms";

export function RetentionPoliciesPanel() {
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
    setFormData({ name: "", code: "", description: "", retentionPeriodDays: 365, action: "archive", triggerOn: "created" });
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

  const formatRetentionPeriod = (days: number) => {
    if (days >= 365) { const years = Math.floor(days / 365); return `${years} year${years > 1 ? "s" : ""}`; }
    if (days >= 30) { const months = Math.floor(days / 30); return `${months} month${months > 1 ? "s" : ""}`; }
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <Archive className="w-4 h-4 text-accent-cyan" />
            Retention Policies ({retentionPolicies.length})
          </h3>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400 dark:text-stone-500" />
            </div>
          ) : retentionPolicies.length === 0 ? (
            <div className="text-center py-8 text-stone-500 dark:text-stone-400">No retention policies configured yet</div>
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
                    <TableCell className="font-mono font-medium">{policy.code}</TableCell>
                    <TableCell>{policy.name}</TableCell>
                    <TableCell>{formatRetentionPeriod(policy.retentionPeriodDays || 365)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        policy.action === "delete" ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400"
                          : policy.action === "archive" ? "bg-accent-cyan/10 text-accent-cyan"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      }>
                        {policy.action || "archive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(policy)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => policy.id && setConfirmDeleteId(policy.id)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Edit Retention Policy" : "Create Retention Policy"}</DialogTitle>
            <DialogDescription>{editingPolicy ? "Update the retention policy configuration" : "Define a new retention policy for document lifecycle management"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rp-name">Name *</Label>
                <Input id="rp-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Financial Records" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rp-code">Code *</Label>
                <Input id="rp-code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g., FIN-7Y" disabled={!!editingPolicy} className="font-mono" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rp-description">Description</Label>
              <Textarea id="rp-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this retention policy..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rp-days">Retention Period (Days)</Label>
                <Input id="rp-days" type="number" value={formData.retentionPeriodDays} onChange={(e) => setFormData({ ...formData, retentionPeriodDays: parseInt(e.target.value) || 365 })} min={1} />
                <p className="text-xs text-stone-500 dark:text-stone-400">{formatRetentionPeriod(formData.retentionPeriodDays)}</p>
              </div>
              <div className="grid gap-2">
                <Label>Trigger On</Label>
                <Select value={formData.triggerOn} onValueChange={(value: "created" | "modified" | "approved") => setFormData({ ...formData, triggerOn: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Select value={formData.action} onValueChange={(value: "archive" | "delete" | "review") => setFormData({ ...formData, action: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.code}>
              {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingPolicy ? "Updating..." : "Creating..."}</>) : editingPolicy ? "Update" : "Create"}
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
        onConfirm={async () => { if (confirmDeleteId) await deleteRetentionPolicy(confirmDeleteId); setConfirmDeleteId(null); }}
      />
    </div>
  );
}
