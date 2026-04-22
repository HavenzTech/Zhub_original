"use client";

import type { Equipment, PropertySystem, Sensor } from "../../types";
import { StatusDot } from "../shared/StatusDot";
import { HealthGauge } from "../shared/HealthGauge";
import { EmptyState } from "../shared/EmptyState";
import { Flame, Gauge, Plug, Shield, Waves, Wind, Wifi, Zap } from "lucide-react";

function systemIcon(kind: PropertySystem["kind"]) {
  switch (kind) {
    case "hvac": return <Wind className="w-5 h-5 text-sky-500" />;
    case "electrical": return <Plug className="w-5 h-5 text-amber-500" />;
    case "plumbing":
    case "water": return <Waves className="w-5 h-5 text-cyan-500" />;
    case "power_gen": return <Zap className="w-5 h-5 text-yellow-500" />;
    case "fire": return <Flame className="w-5 h-5 text-red-500" />;
    case "security": return <Shield className="w-5 h-5 text-violet-500" />;
    case "comms": return <Wifi className="w-5 h-5 text-emerald-500" />;
    default: return <Gauge className="w-5 h-5 text-stone-500" />;
  }
}

interface Props {
  systems: PropertySystem[];
  equipment: Equipment[];
  sensors: Sensor[];
}

export function SystemsTab({ systems, equipment, sensors }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {systems.map((s) => {
        const eq = equipment.filter((e) => e.systemId === s.id);
        const sensorCount = sensors.filter((x) => eq.some((e) => e.id === x.equipmentId)).length;
        return (
          <div key={s.id} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
                  {systemIcon(s.kind)}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <StatusDot status={s.status === "nominal" ? "nominal" : s.status === "degraded" ? "warning" : s.status === "critical" ? "critical" : "offline"} />
                    {s.status}
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{s.name}</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 capitalize">{s.kind.replace("_", " ")}</p>
                </div>
              </div>
              <HealthGauge score={s.healthScore} size="sm" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-stone-200 dark:border-stone-800 p-2">
                <div className="uppercase text-[10px] tracking-wide text-stone-500">Equipment</div>
                <div className="text-lg font-bold text-stone-900 dark:text-stone-50 tabular-nums">{eq.length}</div>
              </div>
              <div className="rounded-md border border-stone-200 dark:border-stone-800 p-2">
                <div className="uppercase text-[10px] tracking-wide text-stone-500">Sensors</div>
                <div className="text-lg font-bold text-stone-900 dark:text-stone-50 tabular-nums">{sensorCount}</div>
              </div>
            </div>
            {eq.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {eq.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <span className="truncate">{e.name}</span>
                    {e.manufacturer && <span className="text-stone-500 dark:text-stone-400 text-[10px] shrink-0">{e.manufacturer}</span>}
                  </li>
                ))}
                {eq.length > 5 && <li className="text-[11px] text-stone-500">+{eq.length - 5} more</li>}
              </ul>
            )}
          </div>
        );
      })}
      {systems.length === 0 && (
        <div className="col-span-full">
          <EmptyState
            icon={<Gauge className="w-5 h-5" />}
            title="No systems registered"
            description="Define the building systems (HVAC, electrical, fire, power generation, etc.) to organize equipment and sensors under a health rollup."
            actionLabel="Add System"
            onAction={() => {}}
          />
        </div>
      )}
    </div>
  );
}
