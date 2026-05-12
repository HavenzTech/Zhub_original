"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot } from "../../shared/StatusDot";

interface Props {
  title: string;
  subtitle?: string;
  counts: { nominal: number; warning: number; critical: number; offline: number };
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SensorGroup({ title, subtitle, counts, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const worst =
    counts.critical > 0 ? "critical"
    : counts.warning > 0 ? "warning"
    : counts.offline > 0 ? "offline"
    : "nominal";
  const total = counts.nominal + counts.warning + counts.critical + counts.offline;

  return (
    <section className={cn("rounded-xl border bg-white/50 dark:bg-stone-950/50", worst === "critical" ? "border-red-500/40" : "border-stone-200 dark:border-stone-800")}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-stone-500" />}
        <StatusDot status={worst} pulse={worst === "critical"} />
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">{title}</div>
          {subtitle && <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-2 text-[11px] tabular-nums">
          {counts.critical > 0 && <Chip tone="crit" label={`${counts.critical} crit`} />}
          {counts.warning > 0 && <Chip tone="warn" label={`${counts.warning} warn`} />}
          {counts.offline > 0 && <Chip tone="off" label={`${counts.offline} stale`} />}
          <span className="text-stone-500 dark:text-stone-400 px-1">{total}</span>
        </div>
      </button>
      {open && <div className="p-3 pt-0">{children}</div>}
    </section>
  );
}

function Chip({ tone, label }: { tone: "crit" | "warn" | "off"; label: string }) {
  const cls =
    tone === "crit" ? "bg-red-500/10 text-red-500 border-red-500/30"
    : tone === "warn" ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
    : "bg-stone-500/10 text-stone-500 border-stone-500/30";
  return <span className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${cls}`}>{label}</span>;
}
