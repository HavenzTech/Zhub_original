"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WorkflowTaskDto, CompleteTaskRequest, DelegateTaskRequest } from "@/types/bms";

interface WorkflowTaskCardProps {
  task: WorkflowTaskDto;
  onComplete: (request: CompleteTaskRequest) => Promise<void>;
  onDelegate?: (request: DelegateTaskRequest) => Promise<void>;
  onViewDocument?: (documentId: string) => void;
  availableUsers?: Array<{ id: string; name: string }>;
}

export function WorkflowTaskCard({
  task,
  onComplete,
  onDelegate,
  onViewDocument,
  availableUsers = [],
}: WorkflowTaskCardProps) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [comments, setComments] = useState("");
  const [delegateToUserId, setDelegateToUserId] = useState("");
  const [delegateReason, setDelegateReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setComments("");
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    setIsSubmitting(true);
    try {
      const request: CompleteTaskRequest = {
        action: selectedAction,
        comments: comments || undefined,
      };
      await onComplete(request);
      setActionDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelegate = async () => {
    if (!delegateToUserId) return;
    setIsSubmitting(true);
    try {
      const request: DelegateTaskRequest = {
        delegateToUserId,
        reason: delegateReason || undefined,
      };
      await onDelegate?.(request);
      setDelegateDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "approve":
        return "Approve";
      case "reject":
        return "Reject";
      case "request_changes":
        return "Request Changes";
      default:
        return action;
    }
  };

  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date();

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-cyan" />
              {task.documentName || "Document Review"}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {task.stepName || "Review Task"}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {task.status === "pending" && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 text-[10px]">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 text-[10px]">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            {task.assignedToUserName || "Unknown"}
          </div>
          {task.dueAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
            </div>
          )}
        </div>

        {task.comments && (
          <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 p-3 rounded-lg">
            {task.comments}
          </div>
        )}

        <div className="flex items-center gap-2">
          {task.documentId && onViewDocument && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[12px] border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
              onClick={() => onViewDocument(task.documentId!)}
            >
              <FileText className="mr-1 h-3 w-3" />
              View Document
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleActionClick("approve")}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[12px] border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
            onClick={() => handleActionClick("reject")}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Reject
          </Button>
          {onDelegate && availableUsers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[12px] border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
              onClick={() => setDelegateDialogOpen(true)}
            >
              <Send className="mr-1 h-3 w-3" />
              Delegate
            </Button>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {getActionLabel(selectedAction)} Document
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "approve"
                ? "Confirm that you want to approve this document."
                : selectedAction === "reject"
                ? "Please provide a reason for rejecting this document."
                : "Add your comments for this action."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comments">
                Comments {selectedAction === "reject" && "*"}
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  selectedAction === "reject"
                    ? "Explain why you are rejecting this document..."
                    : "Add any comments (optional)..."
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={isSubmitting || (selectedAction === "reject" && !comments)}
              className={
                selectedAction === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : selectedAction === "reject"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                getActionLabel(selectedAction)
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog open={delegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delegate Task</DialogTitle>
            <DialogDescription>
              Assign this task to another user to complete.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Delegate To *</Label>
              <Select value={delegateToUserId} onValueChange={setDelegateToUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delegateReason">Reason (Optional)</Label>
              <Textarea
                id="delegateReason"
                value={delegateReason}
                onChange={(e) => setDelegateReason(e.target.value)}
                placeholder="Why are you delegating this task?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDelegateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelegate}
              disabled={isSubmitting || !delegateToUserId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Delegating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Delegate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
