"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserResponse } from "@/types/bms";
import {
  Mail,
  Shield,
  Calendar,
  Edit,
  Trash2,
  RotateCcw,
  ScanFace,
  X,
} from "lucide-react";
import {
  getRoleBadgeColor,
  getRoleLabel,
  formatDate,
  getInitials,
} from "../utils/userHelpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserDetailModalProps {
  user: UserResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onResetTours: (user: UserResponse) => void;
}

export function UserDetailModal({
  user,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onResetTours,
}: UserDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-stone-900 dark:text-stone-50">
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* User info */}
          <div className="flex items-center gap-4">
            {user.pictureUrl && !imageError ? (
              <Image
                src={user.pictureUrl}
                alt={user.name ?? "User"}
                className="rounded-full object-cover"
                height={56}
                width={56}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                <span className="text-lg font-medium text-accent-cyan">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 truncate">
                {user.name}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {user.email}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 rounded-lg border border-stone-200 dark:border-stone-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </span>
              <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined
              </span>
              <span className="text-sm text-stone-700 dark:text-stone-300">
                {formatDate(user.createdAt)}
              </span>
            </div>
            {user.faceEnrollmentRequired && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <ScanFace className="w-4 h-4" />
                  Face ID
                </span>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                  Required
                </Badge>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                onEdit(user);
                onOpenChange(false);
              }}
              className="w-full justify-start text-sm border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <Edit className="w-4 h-4 mr-3" />
              Edit User
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onResetTours(user);
                onOpenChange(false);
              }}
              className="w-full justify-start text-sm border-stone-200 dark:border-stone-700 text-accent-cyan hover:bg-accent-cyan/5 dark:hover:bg-accent-cyan/10"
            >
              <RotateCcw className="w-4 h-4 mr-3" />
              Reset Onboarding Tours
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onDelete(user);
                onOpenChange(false);
              }}
              className="w-full justify-start text-sm border-stone-200 dark:border-stone-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Deactivate User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
