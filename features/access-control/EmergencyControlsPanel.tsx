"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AlertTriangle, UserX, DoorClosed, ShieldOff, Loader2, Info } from "lucide-react";
import { bmsApi } from "@/lib/services/bmsApi";
import { toast } from "sonner";

export function EmergencyControlsPanel() {
  // Revoke user
  const [revokeUserId, setRevokeUserId] = useState("");
  const [confirmRevokeUser, setConfirmRevokeUser] = useState(false);
  const [isRevokingUser, setIsRevokingUser] = useState(false);

  // Revoke area
  const [revokeAreaId, setRevokeAreaId] = useState("");
  const [confirmRevokeArea, setConfirmRevokeArea] = useState(false);
  const [isRevokingArea, setIsRevokingArea] = useState(false);

  // Lockdown
  const [confirmLockdown, setConfirmLockdown] = useState(false);
  const [isLockingDown, setIsLockingDown] = useState(false);

  const handleRevokeUser = async () => {
    if (!revokeUserId.trim()) return;
    setIsRevokingUser(true);
    try {
      await bmsApi.areaAccess.emergencyRevokeUser(revokeUserId.trim());
      toast.success("All area access revoked for this user");
      setRevokeUserId("");
      setConfirmRevokeUser(false);
    } catch {
      toast.error("Failed to revoke user access");
    } finally {
      setIsRevokingUser(false);
    }
  };

  const handleRevokeArea = async () => {
    if (!revokeAreaId.trim()) return;
    setIsRevokingArea(true);
    try {
      await bmsApi.areaAccess.emergencyRevokeArea(revokeAreaId.trim());
      toast.success("All users removed from this area");
      setRevokeAreaId("");
      setConfirmRevokeArea(false);
    } catch {
      toast.error("Failed to revoke area access");
    } finally {
      setIsRevokingArea(false);
    }
  };

  const handleLockdown = async () => {
    setIsLockingDown(true);
    try {
      await bmsApi.areaAccess.emergencyLockdown();
      toast.success("Company-wide lockdown activated. All area access has been revoked.");
      setConfirmLockdown(false);
    } catch {
      toast.error("Lockdown failed — check your connection and try again");
    } finally {
      setIsLockingDown(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Use these only in emergencies</p>
          <p className="text-sm text-red-600/80 dark:text-red-300/80">
            All actions take effect immediately and sync to every terminal instantly. Access must be re-granted manually afterward — these operations cannot be undone automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {/* Revoke user */}
        <div className="rounded-xl border border-red-200 dark:border-red-900 p-5 space-y-4 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50 text-sm">Revoke User</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Remove all access for one user</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="revoke-user-id" className="text-xs">User ID</Label>
            <Input id="revoke-user-id" placeholder="Enter user ID" value={revokeUserId}
              onChange={(e) => setRevokeUserId(e.target.value)} className="text-sm h-9" />
            <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Info className="w-3 h-3" />Find in Staff &amp; Roles → user detail
            </p>
          </div>
          <Button variant="destructive" size="sm" className="w-full" disabled={!revokeUserId.trim()}
            onClick={() => setConfirmRevokeUser(true)}>
            <UserX className="w-4 h-4 mr-2" />Revoke Access
          </Button>
        </div>

        {/* Revoke area */}
        <div className="rounded-xl border border-orange-200 dark:border-orange-900 p-5 space-y-4 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <DoorClosed className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50 text-sm">Clear Area</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Remove all users from one area</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="revoke-area-id" className="text-xs">Area ID</Label>
            <Input id="revoke-area-id" placeholder="Enter area ID" value={revokeAreaId}
              onChange={(e) => setRevokeAreaId(e.target.value)} className="text-sm h-9" />
            <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Info className="w-3 h-3" />Visible in the area list under your property
            </p>
          </div>
          <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={!revokeAreaId.trim()} onClick={() => setConfirmRevokeArea(true)}>
            <DoorClosed className="w-4 h-4 mr-2" />Clear Area
          </Button>
        </div>

        {/* Company-wide lockdown */}
        <div className="rounded-xl border-2 border-red-500 dark:border-red-700 p-5 space-y-4 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 dark:bg-red-700 flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm">Company Lockdown</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Revoke ALL access company-wide</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Immediately cuts access for every user at every area across the entire company. Use only in emergencies.
          </p>
          <Button variant="destructive" size="sm" className="w-full" onClick={() => setConfirmLockdown(true)}>
            <ShieldOff className="w-4 h-4 mr-2" />Initiate Lockdown
          </Button>
        </div>
      </div>

      {/* Confirm: revoke user */}
      <AlertDialog open={confirmRevokeUser} onOpenChange={setConfirmRevokeUser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <UserX className="w-5 h-5" />Revoke User Access
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke all area access for user <strong>{revokeUserId}</strong>. They will be locked out of every door instantly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeUser} disabled={isRevokingUser}
              className="bg-red-600 hover:bg-red-700 text-white">
              {isRevokingUser ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Revoking...</> : "Confirm Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: revoke area */}
      <AlertDialog open={confirmRevokeArea} onOpenChange={setConfirmRevokeArea}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <DoorClosed className="w-5 h-5" />Clear Area Access
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke access for every user in area <strong>{revokeAreaId}</strong>. No one will be able to enter this area until access is re-granted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingArea}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeArea} disabled={isRevokingArea}
              className="bg-orange-600 hover:bg-orange-700 text-white">
              {isRevokingArea ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Clearing...</> : "Confirm Clear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: lockdown */}
      <AlertDialog open={confirmLockdown} onOpenChange={setConfirmLockdown}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldOff className="w-5 h-5" />Initiate Company-Wide Lockdown
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>This will revoke ALL area access for EVERY user across the entire company.</strong> Every door will be locked to everyone instantly. This cannot be undone automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLockingDown}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLockdown} disabled={isLockingDown}
              className="bg-red-600 hover:bg-red-700 text-white">
              {isLockingDown ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Locking Down...</> : "Initiate Lockdown"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
