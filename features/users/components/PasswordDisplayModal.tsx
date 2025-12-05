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
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{createdUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm">{createdUser?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role:</span>
              <Badge className={getRoleBadgeColor(createdUser?.role)}>
                {getRoleLabel(createdUser?.role)}
              </Badge>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">Temporary Password</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-sm">
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
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
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
