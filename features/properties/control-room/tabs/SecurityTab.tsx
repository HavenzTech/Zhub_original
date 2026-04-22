"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";
import { CameraTile } from "./security/CameraTile";
import { CameraDialog } from "./security/CameraDialog";
import { SeverityPill } from "../shared/SeverityPill";
import {
  getAccessEventsByCamera,
  getAccessEventsByProperty,
  getCamerasByProperty,
} from "../../mock/security";
import type { SecurityCamera } from "../../types";

interface Props {
  propertyId: string;
}

const eventLabel: Record<string, string> = {
  badge_in: "Badge In",
  badge_out: "Badge Out",
  badge_denied: "Badge Denied",
  motion: "Motion",
  door_held: "Door Held",
  tamper: "Tamper",
};

export function SecurityTab({ propertyId }: Props) {
  const cameras = useMemo(() => getCamerasByProperty(propertyId), [propertyId]);
  const events = useMemo(() => getAccessEventsByProperty(propertyId), [propertyId]);

  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selected, setSelected] = useState<SecurityCamera | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    cameras.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [cameras]);

  const filtered = cameras.filter((c) => {
    if (query && !`${c.name} ${c.location}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (tagFilter !== "all" && !c.tags?.includes(tagFilter)) return false;
    return true;
  });

  const liveCount = cameras.filter((c) => c.status === "live" || c.status === "recording").length;
  const degradedCount = cameras.filter((c) => c.status === "degraded").length;
  const offlineCount = cameras.filter((c) => c.status === "offline").length;
  const criticalEvents = events.filter((e) => e.severity === "critical").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<ShieldCheck className="w-4 h-4" />} label="Cameras online" value={`${liveCount} / ${cameras.length}`} tone={liveCount === cameras.length ? "emerald" : "amber"} />
        <StatCard icon={<ShieldAlert className="w-4 h-4" />} label="Degraded" value={String(degradedCount)} tone={degradedCount > 0 ? "amber" : "stone"} />
        <StatCard icon={<ShieldOff className="w-4 h-4" />} label="Offline" value={String(offlineCount)} tone={offlineCount > 0 ? "red" : "stone"} />
        <StatCard icon={<ShieldAlert className="w-4 h-4" />} label="Critical events (24h)" value={String(criticalEvents)} tone={criticalEvents > 0 ? "red" : "stone"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search cameras…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cameras</SelectItem>
            {allTags.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-stone-500 dark:text-stone-400 tabular-nums">{filtered.length} feeds</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <CameraTile key={c.id} camera={c} onExpand={() => setSelected(c)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-stone-500 dark:text-stone-400 p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
            No cameras match filters.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Access & Event Log</h3>
          <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 tabular-nums">{events.length} events</span>
        </div>
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {events.slice(0, 12).map((e) => {
            const cam = cameras.find((c) => c.id === e.cameraId);
            return (
              <li key={e.id} className="py-2 flex items-start gap-3 text-xs">
                <div className="shrink-0 text-[10px] text-stone-500 dark:text-stone-400 tabular-nums w-20">
                  {new Date(e.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <div className="shrink-0"><SeverityPill severity={e.severity} /></div>
                <div className="shrink-0 text-[10px] uppercase tracking-wider text-stone-500 w-20">{eventLabel[e.type]}</div>
                <div className="min-w-0 flex-1">
                  {e.subject && <span className="font-medium text-stone-800 dark:text-stone-200 mr-1.5">{e.subject}</span>}
                  <span className="text-stone-600 dark:text-stone-400">{e.detail}</span>
                </div>
                {cam && (
                  <button
                    onClick={() => setSelected(cam)}
                    className="shrink-0 text-[11px] text-accent-cyan hover:underline"
                  >
                    {cam.name}
                  </button>
                )}
              </li>
            );
          })}
          {events.length === 0 && (
            <li className="py-6 text-center text-stone-500 dark:text-stone-400 text-sm">No events recorded.</li>
          )}
        </ul>
      </div>

      <CameraDialog
        camera={selected}
        events={selected ? getAccessEventsByCamera(selected.id) : []}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

const toneMap: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  red: "text-red-600 dark:text-red-400 bg-red-500/10",
  stone: "text-stone-600 dark:text-stone-400 bg-stone-500/10",
};

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: keyof typeof toneMap }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-3">
      <div className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${toneMap[tone]}`}>
        {icon} {label}
      </div>
      <div className="mt-1.5 text-lg font-bold tabular-nums text-stone-900 dark:text-stone-50">{value}</div>
    </div>
  );
}
