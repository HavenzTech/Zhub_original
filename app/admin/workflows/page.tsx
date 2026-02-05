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
  GitBranch,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflows } from "@/lib/hooks/useWorkflows";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import type { WorkflowDto, CreateWorkflowRequest, UpdateWorkflowRequest, WorkflowStepDto } from "@/types/bms";

const defaultStep: WorkflowStepDto = {
  order: 1,
  type: "approval",
  name: "",
  assigneeType: "role",
  assigneeValue: "",
  parallel: false,
  timeoutHours: 48,
};

export default function WorkflowsAdminPage() {
  const router = useRouter();
  const {
    workflows,
    loading,
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    deactivateWorkflow,
  } = useWorkflows();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    steps: [] as WorkflowStepDto[],
    isDefault: false,
  });

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();

    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);

    loadWorkflows();
    loadUsers();
  }, [loadWorkflows, router]);

  const loadUsers = async () => {
    try {
      const response = await bmsApi.users.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setUsers(
        data.map((u: any) => ({
          id: u.id || "",
          name: u.name || u.email || "",
          email: u.email || "",
        }))
      );
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      steps: [],
      isDefault: false,
    });
    setEditingWorkflow(null);
  };

  const handleEdit = (workflow: WorkflowDto) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name || "",
      code: workflow.code || "",
      description: workflow.description || "",
      steps: workflow.steps || [],
      isDefault: workflow.isDefault || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validate at least one step exists
    if (formData.steps.length === 0) {
      toast.error("Workflow must have at least one step");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure steps have proper order numbers and clean fields
      const orderedSteps = formData.steps.map((step, index) => ({
        order: index + 1,
        type: step.type || "approval",
        name: step.name || `Step ${index + 1}`,
        assigneeType: step.assigneeType || "role",
        assigneeValue: step.assigneeValue || "",
        parallel: step.parallel || false,
        timeoutHours: step.timeoutHours || 48,
      }));

      console.log("📝 Submitting workflow with steps:", orderedSteps);

      if (editingWorkflow) {
        const request: UpdateWorkflowRequest = {
          name: formData.name,
          description: formData.description || undefined,
          steps: orderedSteps,
          isDefault: formData.isDefault,
          isActive: editingWorkflow.isActive !== false,
          defaultTaskTimeoutHours: 48,
        };
        console.log("📝 Update request:", JSON.stringify(request, null, 2));
        await updateWorkflow(editingWorkflow.id!, request);
      } else {
        const request: CreateWorkflowRequest = {
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          steps: orderedSteps,
          isDefault: formData.isDefault,
          defaultTaskTimeoutHours: 48,
        };
        await createWorkflow(request);
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

  const handleToggleActive = async (workflow: WorkflowDto) => {
    if (workflow.isActive) {
      await deactivateWorkflow(workflow.id!);
    } else {
      await activateWorkflow(workflow.id!);
    }
  };

  // Step management functions
  const addStep = () => {
    const newStep: WorkflowStepDto = {
      ...defaultStep,
      order: formData.steps.length + 1,
      name: `Step ${formData.steps.length + 1}`,
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps.map((step, i) => ({ ...step, order: i + 1 })),
    });
  };

  const updateStep = (index: number, updates: Partial<WorkflowStepDto>) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setFormData({ ...formData, steps: newSteps });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...formData.steps];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];

    // Update order numbers
    setFormData({
      ...formData,
      steps: newSteps.map((step, i) => ({ ...step, order: i + 1 })),
    });
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
              <h1 className="text-2xl font-bold">Approval Workflows</h1>
              <p className="text-gray-600">
                Configure document approval workflow definitions
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Workflow
          </Button>
        </div>

        {/* Workflows Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Workflows ({workflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No workflows configured yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-mono text-xs text-gray-500 max-w-[100px] truncate" title={workflow.id}>
                        {workflow.id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {workflow.code}
                      </TableCell>
                      <TableCell>{workflow.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {workflow.steps?.length || 0} steps
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {workflow.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={workflow.isActive ? "default" : "secondary"}
                          className={workflow.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {workflow.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(workflow)}
                          title={workflow.isActive ? "Deactivate" : "Activate"}
                        >
                          {workflow.isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(workflow)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => workflow.id && handleDelete(workflow.id)}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkflow ? "Edit Workflow" : "Create Workflow"}
              </DialogTitle>
              <DialogDescription>
                {editingWorkflow
                  ? "Update the workflow configuration and steps"
                  : "Define a new approval workflow with steps"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Document Approval"
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
                    placeholder="e.g., DOC-APPROVE"
                    disabled={!!editingWorkflow}
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
                  placeholder="Describe this workflow..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Set as Default</Label>
                  <div className="text-xs text-gray-500">
                    Use this workflow when no specific workflow is selected
                  </div>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked })
                  }
                />
              </div>

              {/* Workflow Steps Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Workflow Steps</Label>
                    <p className="text-sm text-gray-500">
                      Define the approval steps for this workflow
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {formData.steps.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No steps configured yet</p>
                    <p className="text-sm">Click &quot;Add Step&quot; to create your first approval step</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.steps.map((step, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Step Order Controls */}
                            <div className="flex flex-col items-center gap-1 pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => moveStep(index, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <div className="text-sm font-bold text-gray-500">
                                {index + 1}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => moveStep(index, "down")}
                                disabled={index === formData.steps.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Step Configuration */}
                            <div className="flex-1 grid gap-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Step Name *</Label>
                                  <Input
                                    value={step.name || ""}
                                    onChange={(e) =>
                                      updateStep(index, { name: e.target.value })
                                    }
                                    placeholder="e.g., Manager Approval"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Step Type</Label>
                                  <Select
                                    value={step.type || "approval"}
                                    onValueChange={(value) =>
                                      updateStep(index, { type: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approval">Approval</SelectItem>
                                      <SelectItem value="review">Review</SelectItem>
                                      <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                  <Label>Assignee Type</Label>
                                  <Select
                                    value={step.assigneeType || "role"}
                                    onValueChange={(value) =>
                                      updateStep(index, { assigneeType: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="role">Role</SelectItem>
                                      <SelectItem value="user">Specific User</SelectItem>
                                      <SelectItem value="manager">Document Owner&apos;s Manager</SelectItem>
                                      <SelectItem value="department_head">Department Head</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Assignee Value</Label>
                                  {step.assigneeType === "user" ? (
                                    <Select
                                      value={step.assigneeValue || ""}
                                      onValueChange={(value) =>
                                        updateStep(index, { assigneeValue: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a user..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {users.map((user) => (
                                          <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : step.assigneeType === "role" ? (
                                    <Select
                                      value={step.assigneeValue || ""}
                                      onValueChange={(value) =>
                                        updateStep(index, { assigneeValue: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a role..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="reviewer">Reviewer</SelectItem>
                                        <SelectItem value="department_head">Department Head</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="legal">Legal</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      value={step.assigneeValue || ""}
                                      onChange={(e) =>
                                        updateStep(index, { assigneeValue: e.target.value })
                                      }
                                      placeholder="Auto-assigned"
                                      disabled
                                    />
                                  )}
                                </div>
                                <div className="grid gap-2">
                                  <Label>Timeout (hours)</Label>
                                  <Input
                                    type="number"
                                    value={step.timeoutHours || 48}
                                    onChange={(e) =>
                                      updateStep(index, {
                                        timeoutHours: parseInt(e.target.value) || 48,
                                      })
                                    }
                                    min={1}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={step.parallel || false}
                                  onCheckedChange={(checked) =>
                                    updateStep(index, { parallel: checked })
                                  }
                                />
                                <Label className="text-sm">
                                  Allow parallel processing (multiple approvers can act simultaneously)
                                </Label>
                              </div>
                            </div>

                            {/* Delete Step Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeStep(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
                    {editingWorkflow ? "Updating..." : "Creating..."}
                  </>
                ) : editingWorkflow ? (
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
          title="Delete Workflow"
          description="Are you sure you want to delete this workflow? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
          icon={Trash2}
          onConfirm={async () => {
            if (confirmDeleteId) await deleteWorkflow(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
