"use client";

import { useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { EmptyState } from "../shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Equipment, WorkOrderStatus } from "../../types";
import { useWorkOrders } from "../../hooks/useWorkOrders";
import { formatCurrency } from "../../utils/propertyHelpers";

const statusTone: Record<WorkOrderStatus, string> = {
  open: "bg-stone-500/10 text-stone-600 border-stone-500/30",
  assigned: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  closed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

interface Props {
  propertyId: string;
  equipment: Equipment[];
  onNew: () => void;
}

export function MaintenanceTab({ propertyId, equipment, onNew }: Props) {
  const { data: workOrders = [], patch } = useWorkOrders(propertyId);
  const [filter, setFilter] = useState<WorkOrderStatus | "all">("all");
  const filtered = filter === "all" ? workOrders : workOrders.filter((w) => w.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as WorkOrderStatus | "all")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">{filtered.length} orders</span>
          <Button size="sm" onClick={onNew}>
            <Plus className="w-4 h-4 mr-1.5" /> New Work Order
          </Button>
        </div>
      </div>

      {filtered.length > 0 && (
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800">
        {filtered.map((w) => {
          const eq = equipment.find((e) => e.id === w.equipmentId);
          return (
            <div key={w.id} className="p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 ${statusTone[w.status]}`}>
                    {w.status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] uppercase text-stone-500 dark:text-stone-400">{w.priority}</span>
                  {eq && <span className="text-[11px] text-stone-500 dark:text-stone-400">· {eq.name}</span>}
                </div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">{w.title}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">{w.description}</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                  {w.assigneeName ? `Assigned to ${w.assigneeName} · ` : ""}
                  opened {new Date(w.createdAt).toLocaleDateString()}
                  {w.cost ? ` · ${formatCurrency(w.cost)}` : ""}
                </div>
              </div>
              <Select value={w.status} onValueChange={(v) => patch(w.id, { status: v as WorkOrderStatus, closedAt: v === "closed" ? new Date().toISOString() : undefined })}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
      )}
      {filtered.length === 0 && (
        workOrders.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-5 h-5" />}
            title="No work orders yet"
            description="Open work orders will appear here — create them manually, or auto-generate from AI insights to keep maintenance tied to telemetry."
            actionLabel="New Work Order"
            onAction={onNew}
          />
        ) : (
          <EmptyState
            title="No matching work orders"
            description="Try a different status filter."
            actionLabel="Show all"
            onAction={() => setFilter("all")}
          />
        )
      )}
    </div>
  );
}
