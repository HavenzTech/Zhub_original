"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, UserCircle2, Users } from "lucide-react";
import { usePropertyStakeholders } from "../../hooks/usePropertyStakeholders";
import { isMockMode } from "../../mock";
import { EmptyState } from "../shared/EmptyState";

interface Props {
  propertyId: string;
  onAdd: () => void;
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

export function StaffTab({ propertyId, onAdd }: Props) {
  const { data: staff = [], remove } = usePropertyStakeholders(propertyId);
  const visible = staff.filter((s) => s.role !== "ceo");

  return (
    <div className="space-y-4">
      {isMockMode() && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs px-3 py-2">
          Staff assignments are frontend-only pending backend <code>property_staff</code> table.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
          {visible.length} assigned staff
        </h3>
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Assign Staff
        </Button>
      </div>
      {visible.length > 0 && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800">
          {visible.map((s) => (
            <div key={s.id} className="flex items-start sm:items-center gap-3 p-3 sm:p-4">
              <UserCircle2 className="w-9 h-9 shrink-0 text-stone-400 dark:text-stone-600" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">{s.displayName}</span>
                  <span className={`text-[10px] uppercase tracking-wide rounded-full border px-2 py-0.5 whitespace-nowrap ${roleTone[s.role] ?? roleTone.viewer}`}>
                    {roleLabel[s.role] ?? s.role}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 truncate">{s.email}</div>
                <div className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                  Added {new Date(s.addedAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(s.id)}
                className="shrink-0 text-stone-500 hover:text-red-500 -mt-1 sm:mt-0"
                aria-label={`Remove ${s.displayName}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {visible.length === 0 && (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="No staff assigned"
          description="Assign facility managers, operations leads, and technicians so they see this property on their dashboard and receive its alerts."
          actionLabel="Assign Staff"
          onAction={onAdd}
        />
      )}
    </div>
  );
}
