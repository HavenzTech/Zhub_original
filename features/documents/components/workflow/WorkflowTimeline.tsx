"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  ArrowRight,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WorkflowInstanceDto, WorkflowStepDto, WorkflowTaskDto } from "@/types/bms";

interface WorkflowTimelineProps {
  workflow: WorkflowInstanceDto;
  steps?: WorkflowStepDto[];
}

const getStepStatus = (
  stepOrder: number,
  currentStepOrder?: number,
  workflowStatus?: string | null,
  tasks?: WorkflowTaskDto[] | null
): "completed" | "current" | "pending" | "rejected" => {
  if (!currentStepOrder) return "pending";

  // Find tasks for this step
  const stepTasks = tasks?.filter((t) => t.stepOrder === stepOrder) || [];
  const hasRejected = stepTasks.some((t) => t.actionTaken === "rejected");
  const allCompleted = stepTasks.length > 0 && stepTasks.every((t) => t.status === "completed");

  if (hasRejected) return "rejected";
  if (stepOrder < currentStepOrder) return "completed";
  if (stepOrder === currentStepOrder) {
    if (workflowStatus === "completed" && allCompleted) return "completed";
    if (workflowStatus === "rejected") return "rejected";
    return "current";
  }
  return "pending";
};

const getStepIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    case "current":
      return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
    case "rejected":
      return <XCircle className="w-6 h-6 text-red-600" />;
    default:
      return <Circle className="w-6 h-6 text-gray-300" />;
  }
};

const getStepLineColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-400";
    case "current":
      return "bg-blue-400";
    case "rejected":
      return "bg-red-400";
    default:
      return "bg-gray-200";
  }
};

export function WorkflowTimeline({ workflow, steps }: WorkflowTimelineProps) {
  // Use steps from workflow if available, otherwise use provided steps
  const workflowSteps = steps || [];

  // Build step list: if we have defined steps use those, otherwise infer from tasks
  const effectiveSteps: { order: number; name: string; type?: string; assignee?: string }[] = [];

  if (workflowSteps.length > 0) {
    workflowSteps.forEach((step) => {
      effectiveSteps.push({
        order: step.order || 0,
        name: step.name || `Step ${step.order}`,
        type: step.type || undefined,
        assignee: step.assigneeValue || undefined,
      });
    });
  } else if (workflow.tasks && workflow.tasks.length > 0) {
    // Infer steps from tasks
    const seenOrders = new Set<number>();
    workflow.tasks.forEach((task) => {
      const order = task.stepOrder || 0;
      if (!seenOrders.has(order)) {
        seenOrders.add(order);
        effectiveSteps.push({
          order,
          name: task.stepName || `Step ${order}`,
          type: task.taskType || undefined,
          assignee: task.assignedToUserName || task.assignedToRole || undefined,
        });
      }
    });
  } else if (workflow.totalSteps) {
    // Fallback: generate generic steps
    for (let i = 1; i <= workflow.totalSteps; i++) {
      effectiveSteps.push({
        order: i,
        name: i === workflow.currentStepOrder ? (workflow.currentStepName || `Step ${i}`) : `Step ${i}`,
      });
    }
  }

  // Sort by order
  effectiveSteps.sort((a, b) => a.order - b.order);

  if (effectiveSteps.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No workflow steps available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {effectiveSteps.map((step, index) => {
        const status = getStepStatus(
          step.order,
          workflow.currentStepOrder,
          workflow.status,
          workflow.tasks
        );

        // Find associated task for this step
        const stepTask = workflow.tasks?.find((t) => t.stepOrder === step.order);

        return (
          <div key={step.order} className="flex items-start gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {getStepIcon(status)}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{status}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {index < effectiveSteps.length - 1 && (
                <div className={`w-0.5 h-12 mt-1 ${getStepLineColor(status)}`} />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${
                  status === "current" ? "text-blue-700" :
                  status === "completed" ? "text-green-700" :
                  status === "rejected" ? "text-red-700" :
                  "text-gray-500"
                }`}>
                  {step.name}
                </span>
                {step.type && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {step.type}
                  </Badge>
                )}
                {status === "current" && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
                )}
              </div>

              {/* Assignee info */}
              {(step.assignee || stepTask?.assignedToUserName || stepTask?.assignedToRole) && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <User className="w-3 h-3" />
                  <span>
                    {stepTask?.assignedToUserName || step.assignee || stepTask?.assignedToRole}
                  </span>
                </div>
              )}

              {/* Task completion info */}
              {stepTask?.completedAt && (
                <div className="text-xs text-gray-400 mt-1">
                  Completed {formatDistanceToNow(new Date(stepTask.completedAt), { addSuffix: true })}
                  {stepTask.completedByUserName && ` by ${stepTask.completedByUserName}`}
                </div>
              )}

              {/* Task action */}
              {stepTask?.actionTaken && (
                <div className="text-xs mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      stepTask.actionTaken === "approved"
                        ? "text-green-700 border-green-300"
                        : stepTask.actionTaken === "rejected"
                        ? "text-red-700 border-red-300"
                        : "text-gray-700"
                    }`}
                  >
                    {stepTask.actionTaken}
                  </Badge>
                </div>
              )}

              {/* Task comments */}
              {stepTask?.comments && (
                <div className="mt-1 text-xs text-gray-500 italic">
                  &ldquo;{stepTask.comments}&rdquo;
                </div>
              )}

              {/* Overdue indicator */}
              {stepTask?.isOverdue && status === "current" && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        );
      })}

      {/* Workflow summary */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Started {workflow.startedAt
              ? formatDistanceToNow(new Date(workflow.startedAt), { addSuffix: true })
              : "recently"}
            {workflow.startedByUserName && ` by ${workflow.startedByUserName}`}
          </span>
          {workflow.completedAt && (
            <span>
              Completed {formatDistanceToNow(new Date(workflow.completedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
