"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Play, Loader2, GitBranch, CheckCircle2 } from "lucide-react";
import { useWorkflows } from "@/lib/hooks/useWorkflows";
import type { WorkflowDto } from "@/types/bms";

interface StartWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName?: string;
  onStartWorkflow: (workflowId?: string) => Promise<void>;
}

export function StartWorkflowModal({
  open,
  onOpenChange,
  documentName,
  onStartWorkflow,
}: StartWorkflowModalProps) {
  const { workflows, loading: loadingWorkflows, loadWorkflows } = useWorkflows();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("default");
  const [isStarting, setIsStarting] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDto | null>(null);

  useEffect(() => {
    if (open) {
      loadWorkflows();
    }
  }, [open, loadWorkflows]);

  // Filter to only active workflows
  const activeWorkflows = workflows.filter((w) => w.isActive !== false);

  // Find default workflow
  const defaultWorkflow = activeWorkflows.find((w) => w.isDefault);

  useEffect(() => {
    if (selectedWorkflowId === "default") {
      setSelectedWorkflow(defaultWorkflow || null);
    } else {
      setSelectedWorkflow(activeWorkflows.find((w) => w.id === selectedWorkflowId) || null);
    }
  }, [selectedWorkflowId, activeWorkflows, defaultWorkflow]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const workflowId = selectedWorkflowId === "default" ? undefined : selectedWorkflowId;
      await onStartWorkflow(workflowId);
      onOpenChange(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Start Workflow
          </DialogTitle>
          <DialogDescription>
            Start an approval workflow for &ldquo;{documentName || "this document"}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {loadingWorkflows ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Loading workflows...</span>
            </div>
          ) : activeWorkflows.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-gray-500 text-sm">
                No active workflows available. Please contact an administrator.
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>Select Workflow</Label>
                <Select
                  value={selectedWorkflowId}
                  onValueChange={setSelectedWorkflowId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workflow..." />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultWorkflow && (
                      <SelectItem value="default">
                        {defaultWorkflow.name} (Default)
                      </SelectItem>
                    )}
                    {activeWorkflows
                      .filter((w) => !w.isDefault)
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id!}>
                          {w.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workflow details */}
              {selectedWorkflow && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="font-medium">{selectedWorkflow.name}</div>
                  {selectedWorkflow.description && (
                    <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
                  )}

                  {/* Steps preview */}
                  {selectedWorkflow.steps && selectedWorkflow.steps.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 uppercase">
                        Workflow Steps ({selectedWorkflow.steps.length})
                      </div>
                      <div className="space-y-1.5">
                        {selectedWorkflow.steps
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((step, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">
                                {step.order || index + 1}
                              </div>
                              <span>{step.name || `Step ${step.order}`}</span>
                              {step.type && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {step.type}
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Workflow flags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.requireAllApprovals && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        All approvals required
                      </Badge>
                    )}
                    {selectedWorkflow.allowSkip && (
                      <Badge variant="outline" className="text-xs">
                        Steps can be skipped
                      </Badge>
                    )}
                    {selectedWorkflow.isDefault && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Default Workflow
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isStarting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={isStarting || activeWorkflows.length === 0}
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
