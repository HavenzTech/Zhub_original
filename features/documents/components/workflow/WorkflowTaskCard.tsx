"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className={isOverdue ? "border-red-300 bg-red-50" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {task.documentName || "Document Review"}
              </CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                {task.stepName || "Review Task"}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {task.status === "pending" && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Assigned to: {task.assignedToUserName || "Unknown"}
              </div>
              {task.dueAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Due: {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                </div>
              )}
            </div>

            {task.comments && (
              <div className="text-sm bg-gray-50 p-3 rounded">
                {task.comments}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              {task.documentId && onViewDocument && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDocument(task.documentId!)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Document
                </Button>
              )}
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleActionClick("approve")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleActionClick("reject")}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              {onDelegate && availableUsers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDelegateDialogOpen(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Delegate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
                  ? "bg-green-600 hover:bg-green-700"
                  : selectedAction === "reject"
                  ? "bg-red-600 hover:bg-red-700"
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
