import type { Sensor } from "../../types";

export function ThresholdRail({ sensor, value }: { sensor: Sensor; value: number | undefined }) {
  const lo = sensor.critMin ?? sensor.warnMin ?? sensor.min ?? 0;
  const hi = sensor.critMax ?? sensor.warnMax ?? sensor.max ?? lo + 1;
  const span = hi - lo || 1;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - lo) / span) * 100));

  const segments: Array<{ from: number; to: number; cls: string; label?: string }> = [];
  if (sensor.critMin !== undefined) segments.push({ from: lo, to: sensor.critMin, cls: "bg-red-500/60" });
  if (sensor.warnMin !== undefined) segments.push({ from: sensor.critMin ?? lo, to: sensor.warnMin, cls: "bg-amber-500/60" });
  const okStart = sensor.warnMin ?? sensor.critMin ?? lo;
  const okEnd = sensor.warnMax ?? sensor.critMax ?? hi;
  segments.push({ from: okStart, to: okEnd, cls: "bg-emerald-500/60" });
  if (sensor.warnMax !== undefined) segments.push({ from: sensor.warnMax, to: sensor.critMax ?? hi, cls: "bg-amber-500/60" });
  if (sensor.critMax !== undefined) segments.push({ from: sensor.critMax, to: hi, cls: "bg-red-500/60" });

  return (
    <div>
      <div className="relative h-2 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`absolute top-0 bottom-0 ${s.cls}`}
            style={{ left: `${pct(s.from)}%`, width: `${Math.max(0, pct(s.to) - pct(s.from))}%` }}
          />
        ))}
        {value !== undefined && (
          <div
            className="absolute -top-1 -bottom-1 w-0.5 bg-stone-950 dark:bg-stone-50"
            style={{ left: `calc(${pct(value)}% - 1px)` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[9px] text-stone-500 dark:text-stone-400 mt-1 tabular-nums">
        <span>{lo.toFixed(1)}</span>
        {sensor.warnMin !== undefined && <span>{sensor.warnMin}</span>}
        {sensor.warnMax !== undefined && <span>{sensor.warnMax}</span>}
        <span>{hi.toFixed(1)}</span>
      </div>
    </div>
  );
}
