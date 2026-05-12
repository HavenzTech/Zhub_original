"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { bmsApi } from "@/lib/services/bmsApi";
import { usePropertyStakeholders } from "../../../hooks/usePropertyStakeholders";
import { toast } from "sonner";
import type { StakeholderRole } from "../../../types";
import type { UserResponse } from "@/types/bms";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  propertyId: string;
}

const roleOptions: { value: StakeholderRole; label: string }[] = [
  { value: "facility_manager", label: "Facility Manager" },
  { value: "operations_lead", label: "Operations Lead" },
  { value: "technician", label: "Technician" },
  { value: "viewer", label: "Viewer" },
];

export function AssignStaffModal({ open, onOpenChange, propertyId }: Props) {
  const { add, data: currentStaff = [] } = usePropertyStakeholders(propertyId);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState<StakeholderRole>("viewer");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) { setSelectedUserId(""); setRole("viewer"); return; }
    setLoadingUsers(true);
    bmsApi.users.getAll()
      .then((res: any) => {
        const list: UserResponse[] = Array.isArray(res) ? res : res?.data ?? [];
        // Filter out users already assigned to this property
        const assignedIds = new Set(currentStaff.map((s) => s.userId));
        setUsers(list.filter((u) => u.id && !assignedIds.has(u.id)));
      })
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await add({ userId: selectedUserId, role });
      toast.success("Staff member assigned");
      onOpenChange(false);
    } catch {
      toast.error("Failed to assign staff member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Staff</DialogTitle>
          <DialogDescription>
            Add a company member to this property with a specific role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>User</Label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-stone-500 py-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id!}>
                      {u.name} <span className="text-stone-400 ml-1">({u.email})</span>
                    </SelectItem>
                  ))}
                  {users.length === 0 && (
                    <SelectItem value="_none" disabled>All company members already assigned</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StakeholderRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={!selectedUserId || submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Assigning…</> : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
