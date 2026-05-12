"use client";

import { cn } from "@/lib/utils";
import type { Sensor, SensorReading, SensorStatus } from "../../../types";
import { SparklineCell } from "../../shared/SparklineCell";
import { StatusDot } from "../../shared/StatusDot";

interface Props {
  sensor: Sensor;
  reading?: SensorReading;
  spark: number[];
  status: SensorStatus;
  stale: boolean;
  pinned: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const statusRing: Record<SensorStatus, string> = {
  nominal: "border-stone-200 dark:border-stone-800",
  warning: "border-amber-500/60",
  critical: "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.6),0_0_18px_rgba(239,68,68,0.25)] animate-[pulse_2s_ease-in-out_infinite]",
  offline: "border-stone-300 dark:border-stone-700 opacity-60",
};

export function SensorTile({ sensor, reading, spark, status, stale, pinned, onClick }: Props) {
  const tone = status === "nominal" ? "ok" : status === "critical" ? "crit" : "warn";
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border bg-white dark:bg-stone-950 p-3 transition-all",
        "hover:border-accent-cyan/60 focus:outline-none focus:border-accent-cyan",
        statusRing[status],
        pinned && "ring-2 ring-accent-cyan/60 ring-offset-2 ring-offset-stone-50 dark:ring-offset-stone-950"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <StatusDot
              status={
                status === "nominal" ? "nominal"
                : status === "warning" ? "warning"
                : status === "critical" ? "critical"
                : "offline"
              }
              pulse={status === "critical"}
            />
            {stale ? "stale" : status}
          </div>
          <div className="text-xs font-medium text-stone-900 dark:text-stone-50 truncate">{sensor.label}</div>
        </div>
        {sensor.critical && (
          <span className="text-[9px] uppercase tracking-wide text-red-500 border border-red-500/30 rounded px-1 py-0.5">crit</span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
            {reading ? reading.value.toFixed(2) : "—"}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {sensor.unit}{stale && reading ? ` · ${Math.round((Date.now() - reading.ts) / 1000)}s ago` : ""}
          </div>
        </div>
        <SparklineCell
          values={spark}
          tone={tone}
          warnMin={sensor.warnMin}
          warnMax={sensor.warnMax}
          critMin={sensor.critMin}
          critMax={sensor.critMax}
        />
      </div>
    </button>
  );
}
