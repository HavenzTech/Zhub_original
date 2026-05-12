"use client";

import { UserCircle2, Users } from "lucide-react";
import { usePropertyStakeholders } from "../../hooks/usePropertyStakeholders";
import { EmptyState } from "../shared/EmptyState";

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
  const { data: staff = [], isLoading } = usePropertyStakeholders(propertyId);

  if (isLoading) {
    return <div className="text-sm text-stone-500 py-4">Loading staff…</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
        {staff.length} company {staff.length === 1 ? "member" : "members"}
      </h3>
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
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="No company members found"
          description="Company members will appear here once they are added to the system."
        />
      )}
    </div>
  );
}
