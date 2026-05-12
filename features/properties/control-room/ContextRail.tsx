"use client";

import { useEffect, useState } from "react";
import { MapPin, Users } from "lucide-react";
import type { Property } from "@/types/bms";
import type { PropertyAlert, PropertyHealthScore, PropertyStakeholder } from "../types";
import { HealthGauge } from "./shared/HealthGauge";
import { StatusDot } from "./shared/StatusDot";
import { getTypeIcon, getStatusColor } from "../utils/propertyHelpers";
import { Badge } from "@/components/ui/badge";
import { LiveTickDot } from "./shared/LiveTickDot";
import { isMockMode } from "../mock";
import { fmtTime, getSiteTimezone, sitesDiffer, tzAbbr, userTimezone } from "../utils/siteTime";

interface ContextRailProps {
  property: Property;
  health: PropertyHealthScore;
  alerts: PropertyAlert[];
  staff?: PropertyStakeholder[];
}

function HealthComponentRow({ label, value }: { label: string; value: number }) {
  const barTone = value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</span>
        <span className="tabular-nums text-xs font-semibold text-stone-900 dark:text-stone-50">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <div className={`h-full ${barTone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function ContextRail({ property, health, alerts, staff = [] }: ContextRailProps) {
  const assignedStaff = staff.filter((s) => s.role !== "ceo");
  const open = alerts.filter((a) => !a.ack).length;
  const crit = alerts.filter((a) => !a.ack && a.severity === "critical").length;
  const mode = isMockMode() ? "MOCK" : "LIVE";
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const siteTz = getSiteTimezone(property);
  const showDual = sitesDiffer(property);

  return (
    <aside className="lg:sticky lg:top-4 h-fit w-full lg:w-72 shrink-0 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-950/60 backdrop-blur p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0">
          {getTypeIcon(property.type)}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <StatusDot status={property.status === "active" ? "nominal" : "warning"} />
            {property.status}
          </div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50 truncate">{property.name}</h2>
          {property.type && (
            <Badge className={getStatusColor(property.status)} variant="secondary">{property.type}</Badge>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <HealthGauge score={health.score} size="lg" label="Health" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-stone-400">Alerts</span>
          <div className="flex items-center gap-2 tabular-nums">
            <span className={`font-semibold ${open > 0 ? (crit > 0 ? "text-red-500" : "text-amber-500") : "text-stone-500"}`}>
              {open}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-stone-400">open</span>
            {crit > 0 && (
              <>
                <span className="h-3 w-px bg-stone-300 dark:bg-stone-700" />
                <span className="font-semibold text-red-500">{crit}</span>
                <span className="text-[10px] uppercase tracking-wide text-red-500/80">crit</span>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {(["systems", "sensors", "ai", "maintenance"] as const).map((k) => (
            <HealthComponentRow key={k} label={k} value={health.components[k]} />
          ))}
        </div>
      </div>

      {(property.locationCity || property.locationProvince) && (
        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
          <MapPin className="w-3.5 h-3.5" />
          {[property.locationCity, property.locationProvince, property.locationCountry].filter(Boolean).join(", ")}
        </div>
      )}

      <div className="rounded-md border border-stone-200 dark:border-stone-800 px-2.5 py-2 text-xs space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">Site time</span>
          <span className="tabular-nums font-semibold text-stone-900 dark:text-stone-50">
            {fmtTime(now, siteTz)}
            <span className="ml-1 text-[9px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{tzAbbr(now, siteTz)}</span>
          </span>
        </div>
        {showDual && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">Your time</span>
            <span className="tabular-nums text-stone-700 dark:text-stone-300">
              {fmtTime(now, userTimezone())}
              <span className="ml-1 text-[9px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{tzAbbr(now, userTimezone())}</span>
            </span>
          </div>
        )}
      </div>

      {assignedStaff.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Staff · {assignedStaff.length}
          </div>
          <ul className="space-y-0.5">
            {assignedStaff.slice(0, 4).map((s) => (
              <li key={s.id} className="text-xs flex items-center justify-between">
                <span className="truncate text-stone-700 dark:text-stone-300">{s.displayName}</span>
                <span className="text-[10px] uppercase text-stone-500 dark:text-stone-400">{s.role.replace("_", " ")}</span>
              </li>
            ))}
            {assignedStaff.length > 4 && (
              <li className="text-[11px] text-stone-500 dark:text-stone-400">+{assignedStaff.length - 4} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
        <LiveTickDot live />
        <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{mode} DATA</span>
      </div>
    </aside>
  );
}
