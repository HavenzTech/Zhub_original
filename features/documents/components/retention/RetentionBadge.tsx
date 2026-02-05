"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Archive, AlertTriangle, Clock, Shield } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface RetentionBadgeProps {
  retentionExpiresAt?: string | null;
  legalHold?: boolean;
  retentionPolicyName?: string | null;
  className?: string;
}

export function RetentionBadge({
  retentionExpiresAt,
  legalHold,
  retentionPolicyName,
  className = "",
}: RetentionBadgeProps) {
  if (!retentionExpiresAt && !legalHold) {
    return null;
  }

  const expiresDate = retentionExpiresAt ? new Date(retentionExpiresAt) : null;
  const isExpiringSoon =
    expiresDate && expiresDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
  const isExpired = expiresDate && expiresDate < new Date();

  if (legalHold) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={`bg-red-100 text-red-800 flex items-center gap-1 cursor-help ${className}`}
            >
              <Shield className="w-3 h-3" />
              Legal Hold
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <div className="font-medium">Legal Hold Active</div>
              <div className="text-gray-400">
                This document cannot be modified or deleted while under legal hold.
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${
              isExpired
                ? "bg-gray-100 text-gray-800"
                : isExpiringSoon
                ? "bg-orange-100 text-orange-800"
                : "bg-purple-100 text-purple-800"
            } flex items-center gap-1 cursor-help ${className}`}
          >
            {isExpired ? (
              <Archive className="w-3 h-3" />
            ) : isExpiringSoon ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {isExpired
              ? "Archived"
              : isExpiringSoon
              ? "Expiring Soon"
              : "Retention"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <div className="font-medium">
              {retentionPolicyName || "Retention Policy"}
            </div>
            {expiresDate && (
              <div className="text-gray-400">
                {isExpired
                  ? `Expired ${formatDistanceToNow(expiresDate, { addSuffix: true })}`
                  : `Expires ${formatDistanceToNow(expiresDate, { addSuffix: true })}`}
              </div>
            )}
            {expiresDate && (
              <div className="text-gray-400 text-xs">
                {format(expiresDate, "PPP")}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
