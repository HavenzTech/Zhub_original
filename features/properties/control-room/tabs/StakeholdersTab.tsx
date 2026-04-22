"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, UserCircle2 } from "lucide-react";
import { usePropertyStakeholders } from "../../hooks/usePropertyStakeholders";
import { isMockMode } from "../../mock";

interface Props {
  propertyId: string;
  onAdd: () => void;
}

const roleTone: Record<string, string> = {
  ceo: "bg-violet-500/10 text-violet-500 border-violet-500/30",
  facility_manager: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  operations_lead: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  technician: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  viewer: "bg-stone-500/10 text-stone-500 border-stone-500/30",
};

export function StakeholdersTab({ propertyId, onAdd }: Props) {
  const { data: stakeholders = [], remove } = usePropertyStakeholders(propertyId);
  return (
    <div className="space-y-4">
      {isMockMode() && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs px-3 py-2">
          Stakeholder persistence is frontend-only pending backend <code>property_stakeholders</code> table.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{stakeholders.length} stakeholder{stakeholders.length !== 1 ? "s" : ""}</h3>
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Stakeholder
        </Button>
      </div>
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800">
        {stakeholders.map((s) => (
          <div key={s.id} className="flex items-center gap-4 p-4">
            <UserCircle2 className="w-9 h-9 text-stone-400 dark:text-stone-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">{s.displayName}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{s.email}</div>
            </div>
            <span className={`text-[11px] uppercase tracking-wide rounded-full border px-2 py-0.5 ${roleTone[s.role] ?? roleTone.viewer}`}>
              {s.role.replace("_", " ")}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 w-24 shrink-0">
              {new Date(s.addedAt).toLocaleDateString()}
            </span>
            <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="text-stone-500 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {stakeholders.length === 0 && (
          <div className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">No stakeholders yet.</div>
        )}
      </div>
    </div>
  );
}
