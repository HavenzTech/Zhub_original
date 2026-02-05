"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Unlock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CheckoutStatusBadgeProps {
  isCheckedOut?: boolean;
  checkedOutByUserName?: string | null;
  checkedOutAt?: string | null;
  checkOutExpiresAt?: string | null;
  isCheckedOutByMe?: boolean;
  className?: string;
}

export function CheckoutStatusBadge({
  isCheckedOut,
  checkedOutByUserName,
  checkedOutAt,
  checkOutExpiresAt,
  isCheckedOutByMe,
  className = "",
}: CheckoutStatusBadgeProps) {
  if (!isCheckedOut) {
    return null;
  }

  const expiresText = checkOutExpiresAt
    ? `Expires ${formatDistanceToNow(new Date(checkOutExpiresAt), { addSuffix: true })}`
    : null;

  const checkedOutText = checkedOutAt
    ? `Checked out ${formatDistanceToNow(new Date(checkedOutAt), { addSuffix: true })}`
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${
              isCheckedOutByMe
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            } flex items-center gap-1 cursor-help ${className}`}
          >
            <Lock className="w-3 h-3" />
            {isCheckedOutByMe ? "Checked out by you" : "Locked"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <div className="font-medium">
              Checked out by {checkedOutByUserName || "Unknown"}
            </div>
            {checkedOutText && (
              <div className="text-gray-400">{checkedOutText}</div>
            )}
            {expiresText && (
              <div className="text-gray-400">{expiresText}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
