"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserResponse, AreaAccess } from "@/types/bms";
import {
  Mail,
  Shield,
  Calendar,
  Edit,
  Trash2,
  RotateCcw,
  ScanFace,
  MapPin,
  Loader2,
  AlertTriangle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bmsApi } from "@/lib/services/bmsApi";
import { toast } from "sonner";

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
  const [areaAccess, setAreaAccess] = useState<AreaAccess[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [isEmergencyRevoking, setIsEmergencyRevoking] = useState(false);

  // Load area access whenever the modal opens for a user
  useEffect(() => {
    if (!open || !user?.id) { setAreaAccess([]); return; }
    setLoadingAccess(true);
    bmsApi.areaAccess.getByUser(user.id)
      .then((res) => setAreaAccess(Array.isArray(res) ? res : []))
      .catch(() => setAreaAccess([]))
      .finally(() => setLoadingAccess(false));
  }, [open, user?.id]);

  const handleRevokeArea = async (access: AreaAccess) => {
    if (!access.id) return;
    setRevokingId(access.id);
    try {
      await bmsApi.areaAccess.revoke(access.id);
      setAreaAccess((prev) => prev.filter((a) => a.id !== access.id));
      toast.success(`Access to ${access.areaName ?? "area"} revoked`);
    } catch {
      toast.error("Failed to revoke access");
    } finally {
      setRevokingId(null);
    }
  };

  const handleEmergencyRevoke = async () => {
    if (!user?.id) return;
    setIsEmergencyRevoking(true);
    try {
      await bmsApi.areaAccess.emergencyRevokeUser(user.id);
      setAreaAccess([]);
      toast.success(`All access revoked for ${user.name ?? user.email}`);
      setShowEmergencyConfirm(false);
    } catch {
      toast.error("Emergency revoke failed");
    } finally {
      setIsEmergencyRevoking(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-900 dark:text-stone-50">User Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* User info */}
            <div className="flex items-center gap-4">
              {user.pictureUrl && !imageError ? (
                <Image src={user.pictureUrl} alt={user.name ?? "User"} className="rounded-full object-cover"
                  height={56} width={56} onError={() => setImageError(true)} />
              ) : (
                <div className="w-14 h-14 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-accent-cyan">{getInitials(user.name)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 truncate">{user.name}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />{user.email}
                </p>
              </div>
            </div>

            {/* Core details */}
            <div className="space-y-3 rounded-lg border border-stone-200 dark:border-stone-700 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />Role
                </span>
                <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>{getRoleLabel(user.role)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />Joined
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-300">{formatDate(user.createdAt)}</span>
              </div>
              {user.faceEnrollmentRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <ScanFace className="w-4 h-4" />Face ID
                  </span>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">Required</Badge>
                </div>
              )}
            </div>

            {/* Area Access */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />Area Access
              </p>
              {loadingAccess ? (
                <div className="flex items-center gap-2 text-sm text-stone-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />Loading...
                </div>
              ) : areaAccess.length === 0 ? (
                <p className="text-sm text-stone-400 dark:text-stone-500 italic">No area access granted</p>
              ) : (
                <div className="rounded-lg border border-stone-200 dark:border-stone-700 divide-y divide-stone-100 dark:divide-stone-800">
                  {areaAccess.map((access) => (
                    <div key={access.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{access.areaName ?? access.areaId}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">{access.propertyName} · {access.accessLevel}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-red-500"
                        disabled={revokingId === access.id}
                        onClick={() => handleRevokeArea(access)}>
                        {revokingId === access.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" onClick={() => { onEdit(user); onOpenChange(false); }}
                className="w-full justify-start text-sm border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                <Edit className="w-4 h-4 mr-3" />Edit User
              </Button>
              <Button variant="outline" onClick={() => { onResetTours(user); onOpenChange(false); }}
                className="w-full justify-start text-sm border-stone-200 dark:border-stone-700 text-accent-cyan hover:bg-accent-cyan/5 dark:hover:bg-accent-cyan/10">
                <RotateCcw className="w-4 h-4 mr-3" />Reset Onboarding Tours
              </Button>
              <Button variant="outline" onClick={() => setShowEmergencyConfirm(true)}
                className="w-full justify-start text-sm border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                <AlertTriangle className="w-4 h-4 mr-3" />Revoke All Area Access
              </Button>
              <Button variant="outline" onClick={() => { onDelete(user); onOpenChange(false); }}
                className="w-full justify-start text-sm border-stone-200 dark:border-stone-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                <Trash2 className="w-4 h-4 mr-3" />Deactivate User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency revoke confirmation */}
      <AlertDialog open={showEmergencyConfirm} onOpenChange={setShowEmergencyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />Revoke All Area Access
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke <strong>{user.name ?? user.email}</strong>&apos;s access to every area they can currently enter. This action syncs to all terminals instantly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEmergencyRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmergencyRevoke} disabled={isEmergencyRevoking}
              className="bg-red-600 hover:bg-red-700 text-white">
              {isEmergencyRevoking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Revoking...</> : "Revoke All Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
