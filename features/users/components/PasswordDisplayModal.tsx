"use client";

import { useState } from "react";
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
import type { CreateUserResponse } from "@/types/bms";
import { Check, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { getRoleBadgeColor, getRoleLabel } from "../utils/userHelpers";

interface PasswordDisplayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdUser: CreateUserResponse | null;
}

export function PasswordDisplayModal({
  open,
  onOpenChange,
  createdUser,
}: PasswordDisplayModalProps) {
  const [passwordCopied, setPasswordCopied] = useState(false);

  const copyPassword = () => {
    if (createdUser?.temporaryPassword) {
      navigator.clipboard.writeText(createdUser.temporaryPassword);
      setPasswordCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            User Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Please save the temporary password. The user will need it to log in
            for the first time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Email:</span>
              <span className="text-sm text-stone-900 dark:text-stone-100">{createdUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Name:</span>
              <span className="text-sm text-stone-900 dark:text-stone-100">{createdUser?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Role:</span>
              <Badge className={getRoleBadgeColor(createdUser?.role)}>
                {getRoleLabel(createdUser?.role)}
              </Badge>
            </div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">Temporary Password</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 p-2 bg-white dark:bg-stone-900 rounded border border-amber-200 dark:border-amber-800 font-mono text-sm text-stone-900 dark:text-stone-100">
                {createdUser?.temporaryPassword}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPassword}
                className="shrink-0"
              >
                {passwordCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
              Send this password to the user via a secure channel (email, Slack,
              etc.)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it, close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
