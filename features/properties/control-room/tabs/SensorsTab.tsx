"use client";

import { useMemo, useState } from "react";
import type { Property } from "@/types/bms";
import type {
  Equipment,
  HistoryRange,
  PropertySystem,
  PropertyZone,
  Sensor,
  SensorStatus,
} from "../../types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSensorStream } from "../../hooks/useSensorStream";
import { useSensorHistory } from "../../hooks/useSensorHistory";
import { sensorStatus } from "./sensors/sensorStatus";
import { SensorTile } from "./sensors/SensorTile";
import { SensorGroup } from "./sensors/SensorGroup";
import { EmptyState } from "../shared/EmptyState";
import { Activity } from "lucide-react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  property: Property;
  sensors: Sensor[];
  systems: PropertySystem[];
  zones: PropertyZone[];
  equipment: Equipment[];
}

const STALE_MS = 5000;
const WORST_RANK: Record<SensorStatus, number> = { critical: 0, warning: 1, offline: 2, nominal: 3 };

export function SensorsTab({ property, sensors, systems, zones, equipment }: Props) {
  const [query, setQuery] = useState("");
  const [systemId, setSystemId] = useState<string>("all");
  const [zoneId, setZoneId] = useState<string>("all");
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [drawerSensor, setDrawerSensor] = useState<Sensor | null>(null);

  const filtered = useMemo(() => {
    return sensors.filter((s) => {
      if (onlyCritical && !s.critical) return false;
      if (query && !s.label.toLowerCase().includes(query.toLowerCase())) return false;
      if (systemId !== "all") {
        const eq = equipment.find((e) => e.id === s.equipmentId);
        if (!eq || eq.systemId !== systemId) return false;
      }
      if (zoneId !== "all") {
        const eq = equipment.find((e) => e.id === s.equipmentId);
        if ((eq?.zoneId ?? s.zoneId) !== zoneId) return false;
      }
      return true;
    });
  }, [sensors, onlyCritical, query, systemId, zoneId, equipment]);

  const sensorIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const { latest, sparklines } = useSensorStream(property.id as string, sensorIds);

  const now = Date.now();
  const statuses = useMemo(() => {
    const map = new Map<string, { status: SensorStatus; stale: boolean }>();
    for (const s of filtered) {
      const r = latest[s.id];
      const stale = !r || now - r.ts > STALE_MS;
      const status: SensorStatus = stale ? "offline" : sensorStatus(s, r.value);
      map.set(s.id, { status, stale });
    }
    return map;
  }, [filtered, latest, now]);

  const groups = useMemo(() => {
    const byEq = new Map<string, { eq: Equipment | null; list: Sensor[] }>();
    for (const s of filtered) {
      const eq = s.equipmentId ? equipment.find((e) => e.id === s.equipmentId) ?? null : null;
      const key = eq?.id ?? "__plant__";
      if (!byEq.has(key)) byEq.set(key, { eq, list: [] });
      byEq.get(key)!.list.push(s);
    }
    const out = Array.from(byEq.values()).map(({ eq, list }) => {
      const sortedList = list.slice().sort((a, b) => {
        const sa = statuses.get(a.id)?.status ?? "nominal";
        const sb = statuses.get(b.id)?.status ?? "nominal";
        if (WORST_RANK[sa] !== WORST_RANK[sb]) return WORST_RANK[sa] - WORST_RANK[sb];
        return a.label.localeCompare(b.label);
      });
      const counts = { nominal: 0, warning: 0, critical: 0, offline: 0 };
      for (const s of sortedList) counts[statuses.get(s.id)?.status ?? "nominal"]++;
      const sys = eq ? systems.find((sy) => sy.id === eq.systemId) : null;
      return {
        key: eq?.id ?? "__plant__",
        title: eq?.name ?? "Plant-wide",
        subtitle: eq ? [sys?.name, [eq.manufacturer, eq.model].filter(Boolean).join(" ")].filter(Boolean).join(" · ") : undefined,
        sensors: sortedList,
        counts,
        worstRank: counts.critical > 0 ? 0 : counts.warning > 0 ? 1 : counts.offline > 0 ? 2 : 3,
      };
    });
    out.sort((a, b) => a.worstRank - b.worstRank || a.title.localeCompare(b.title));
    return out;
  }, [filtered, equipment, systems, statuses]);

  function handleTileClick(sensor: Sensor, e: React.MouseEvent) {
    if (e.shiftKey) {
      setPinned((p) => {
        const n = new Set(p);
        if (n.has(sensor.id)) n.delete(sensor.id);
        else if (n.size < 4) n.add(sensor.id);
        return n;
      });
      return;
    }
    setDrawerSensor(sensor);
  }

  const pinnedList = useMemo(
    () => Array.from(pinned).map((id) => filtered.find((s) => s.id === id)).filter(Boolean) as Sensor[],
    [pinned, filtered]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search sensors…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Select value={systemId} onValueChange={setSystemId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="System" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All systems</SelectItem>
            {systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={zoneId} onValueChange={setZoneId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Zone" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All zones</SelectItem>
            {zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
          <Switch checked={onlyCritical} onCheckedChange={setOnlyCritical} />
          Critical only
        </label>
        <div className="ml-auto text-xs text-stone-500 dark:text-stone-400 tabular-nums">{filtered.length} sensors</div>
      </div>

      <div className="rounded-md border border-accent-cyan/20 bg-accent-cyan/5 text-[11px] text-stone-600 dark:text-stone-400 px-3 py-1.5">
        Tip: click a tile to open history · <kbd className="px-1 rounded bg-stone-200 dark:bg-stone-800 text-[10px]">Shift</kbd>+click to pin up to 4 sensors for overlay comparison.
      </div>

      {pinnedList.length > 0 && (
        <CompareOverlay sensors={pinnedList} onClear={() => setPinned(new Set())} onUnpin={(id) => setPinned((p) => { const n = new Set(p); n.delete(id); return n; })} />
      )}

      <div className="space-y-3">
        {groups.map((g) => (
          <SensorGroup
            key={g.key}
            title={g.title}
            subtitle={g.subtitle}
            counts={g.counts}
            defaultOpen={g.worstRank <= 1 || groups.length <= 3}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {g.sensors.map((s) => {
                const st = statuses.get(s.id) ?? { status: "nominal" as SensorStatus, stale: true };
                return (
                  <SensorTile
                    key={s.id}
                    sensor={s}
                    reading={latest[s.id]}
                    spark={sparklines[s.id] ?? []}
                    status={st.status}
                    stale={st.stale}
                    pinned={pinned.has(s.id)}
                    onClick={(e) => handleTileClick(s, e)}
                  />
                );
              })}
            </div>
          </SensorGroup>
        ))}
        {groups.length === 0 && (
          sensors.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-5 h-5" />}
              title="No sensors configured"
              description="This property has no sensors yet. Import from the site's BMS/SCADA, connect a gateway, or add sensors manually to start streaming telemetry."
              actionLabel="Import from BMS"
              secondaryLabel="Add Manually"
              onAction={() => {}}
              onSecondary={() => {}}
            />
          ) : (
            <EmptyState
              title="No sensors match filters"
              description="Try clearing search, or switching system/zone filters."
              actionLabel="Clear filters"
              onAction={() => { setQuery(""); setSystemId("all"); setZoneId("all"); setOnlyCritical(false); }}
            />
          )
        )}
      </div>

      <SensorDrawer sensor={drawerSensor} onClose={() => setDrawerSensor(null)} />
    </div>
  );
}

function SensorDrawer({ sensor, onClose }: { sensor: Sensor | null; onClose: () => void }) {
  const [range, setRange] = useState<HistoryRange>("1h");
  const { data } = useSensorHistory(sensor?.id, range);
  if (!sensor) return null;
  const showDate = range === "7d" || range === "30d";
  const series = (data ?? []).map((r) => {
    const d = new Date(r.ts);
    const t = showDate
      ? d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return { t, v: r.value };
  });
  return (
    <Dialog open={!!sensor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{sensor.label}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 text-xs">
          {(["1h", "24h", "7d", "30d"] as HistoryRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded border ${range === r ? "border-accent-cyan text-accent-cyan" : "border-stone-200 dark:border-stone-800 text-stone-500"}`}
            >
              {r}
            </button>
          ))}
          <span className="ml-auto text-stone-500 dark:text-stone-400">unit: {sensor.unit}</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="t"
                tick={{ fontSize: 10 }}
                minTickGap={40}
                tickMargin={6}
                stroke="currentColor"
                className="text-stone-500"
              />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              {sensor.warnMax !== undefined && <ReferenceLine y={sensor.warnMax} stroke="#f59e0b" strokeDasharray="4 4" />}
              {sensor.critMax !== undefined && <ReferenceLine y={sensor.critMax} stroke="#ef4444" strokeDasharray="4 4" />}
              {sensor.warnMin !== undefined && <ReferenceLine y={sensor.warnMin} stroke="#f59e0b" strokeDasharray="4 4" />}
              {sensor.critMin !== undefined && <ReferenceLine y={sensor.critMin} stroke="#ef4444" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const COMPARE_COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

function CompareOverlay({ sensors, onClear, onUnpin }: { sensors: Sensor[]; onClear: () => void; onUnpin: (id: string) => void }) {
  const h0 = useSensorHistory(sensors[0]?.id, "1h");
  const h1 = useSensorHistory(sensors[1]?.id, "1h");
  const h2 = useSensorHistory(sensors[2]?.id, "1h");
  const h3 = useSensorHistory(sensors[3]?.id, "1h");
  const histories = [h0, h1, h2, h3];
  const updatedKey = histories.map((h) => h.dataUpdatedAt ?? 0).join("|");

  const merged = useMemo(() => {
    const byTime = new Map<number, Record<string, number | string>>();
    sensors.forEach((sensor, i) => {
      (histories[i]?.data ?? []).forEach((r) => {
        const bucket = Math.floor(r.ts / 15000) * 15000;
        if (!byTime.has(bucket)) byTime.set(bucket, { t: new Date(bucket).toLocaleTimeString() });
        byTime.get(bucket)![sensor.id] = r.value;
      });
    });
    return Array.from(byTime.entries()).sort(([a], [b]) => a - b).map(([, v]) => v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedKey, sensors.map((s) => s.id).join("|")]);

  return (
    <div className="rounded-xl border border-accent-cyan/40 bg-white dark:bg-stone-950 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Compare · {sensors.length} pinned
        </h4>
        <Button size="sm" variant="ghost" onClick={onClear} className="h-7 text-xs">Clear all</Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {sensors.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onUnpin(s.id)}
            className="group text-[11px] rounded-full border px-2 py-0.5 flex items-center gap-1.5"
            style={{ borderColor: COMPARE_COLORS[i], color: COMPARE_COLORS[i] }}
          >
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: COMPARE_COLORS[i] }} />
            {s.label}
            <X className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <LineChart data={merged}>
            <XAxis dataKey="t" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {sensors.map((s, i) => (
              <Line key={s.id} type="monotone" dataKey={s.id} name={s.label} stroke={COMPARE_COLORS[i]} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
