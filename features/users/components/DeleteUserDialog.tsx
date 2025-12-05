"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { UserResponse } from "@/types/bms";
import { Trash2, Loader2 } from "lucide-react";
import { getRoleBadgeColor, getRoleLabel } from "../utils/userHelpers";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  isSubmitting,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Deactivate User?
          </DialogTitle>
          <DialogDescription>
            This will deactivate the user account. They will not be able to log
            in anymore.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User:</span>
              <span className="text-sm">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role:</span>
              <Badge className={getRoleBadgeColor(user?.role)}>
                {getRoleLabel(user?.role)}
              </Badge>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> This action will prevent the user from
              logging in. Their data will be preserved for audit purposes.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Deactivate User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
