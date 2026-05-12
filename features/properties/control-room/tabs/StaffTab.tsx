"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, UserCircle2, Users } from "lucide-react";
import { usePropertyStakeholders } from "../../hooks/usePropertyStakeholders";
import { EmptyState } from "../shared/EmptyState";
import { AssignStaffModal } from "./staff/AssignStaffModal";
import { toast } from "sonner";

interface Props {
  propertyId: string;
}

const roleLabel: Record<string, string> = {
  facility_manager: "Facility Manager",
  operations_lead: "Operations Lead",
  technician: "Technician",
  viewer: "Viewer",
};

const roleTone: Record<string, string> = {
  facility_manager: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  operations_lead: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  technician: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  viewer: "bg-stone-500/10 text-stone-500 border-stone-500/30",
};

export function StaffTab({ propertyId }: Props) {
  const { data: staff = [], isLoading, remove } = usePropertyStakeholders(propertyId);
  const [showAssign, setShowAssign] = useState(false);

  async function handleRemove(userId: string, name: string) {
    try {
      await remove(userId);
      toast.success(`${name} removed from property`);
    } catch {
      toast.error("Failed to remove staff member");
    }
  }

  if (isLoading) {
    return <div className="text-sm text-stone-500 py-4">Loading staff…</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            {staff.length} assigned {staff.length === 1 ? "member" : "members"}
          </h3>
          <Button size="sm" onClick={() => setShowAssign(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Assign Staff
          </Button>
        </div>

        {staff.length > 0 ? (
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 sm:p-4">
                <UserCircle2 className="w-9 h-9 shrink-0 text-stone-400 dark:text-stone-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">{s.displayName}</span>
                    <span className={`text-[10px] uppercase tracking-wide rounded-full border px-2 py-0.5 whitespace-nowrap ${roleTone[s.role] ?? roleTone.viewer}`}>
                      {roleLabel[s.role] ?? s.role}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 truncate">{s.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(s.userId, s.displayName)}
                  className="shrink-0 text-stone-400 hover:text-red-500"
                  aria-label={`Remove ${s.displayName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title="No staff assigned"
            description="Assign facility managers, operations leads, and technicians to this property."
            actionLabel="Assign Staff"
            onAction={() => setShowAssign(true)}
          />
        )}
      </div>

      <AssignStaffModal
        open={showAssign}
        onOpenChange={setShowAssign}
        propertyId={propertyId}
      />
    </>
  );
}
