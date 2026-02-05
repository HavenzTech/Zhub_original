"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GitBranch, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import type { WorkflowStatus } from "@/types/bms";

interface WorkflowStatusBadgeProps {
  status?: WorkflowStatus | string | null;
  currentStep?: string | null;
  totalSteps?: number;
  currentStepNumber?: number;
  className?: string;
}

const getStatusConfig = (status?: WorkflowStatus | string | null) => {
  switch (status) {
    case 'in_progress':
      return {
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-800',
        icon: Loader2,
        iconClassName: 'animate-spin',
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        iconClassName: '',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        iconClassName: '',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800',
        icon: XCircle,
        iconClassName: '',
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        iconClassName: '',
      };
  }
};

export function WorkflowStatusBadge({
  status,
  currentStep,
  totalSteps,
  currentStepNumber,
  className = "",
}: WorkflowStatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const hasProgress = currentStepNumber !== undefined && totalSteps !== undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${config.className} flex items-center gap-1 cursor-help ${className}`}
          >
            <Icon className={`w-3 h-3 ${config.iconClassName}`} />
            {config.label}
            {hasProgress && (
              <span className="text-xs opacity-75">
                ({currentStepNumber}/{totalSteps})
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <div className="font-medium flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Workflow Status
            </div>
            <div className="text-gray-400">{config.label}</div>
            {currentStep && (
              <div className="text-gray-400">Current: {currentStep}</div>
            )}
            {hasProgress && (
              <div className="text-gray-400">
                Step {currentStepNumber} of {totalSteps}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
