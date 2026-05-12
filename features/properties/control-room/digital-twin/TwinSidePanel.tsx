"use client";

import { Button } from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles, Wrench } from "lucide-react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type {
  AIInsight,
  Equipment,
  MaintenanceWorkOrder,
  PropertyAlert,
  Sensor,
} from "../../types";
import type { TwinHotspotDescriptor } from "./DigitalTwinViewer";
import { useSensorHistory } from "../../hooks/useSensorHistory";
import { useSensorStream } from "../../hooks/useSensorStream";
import { sensorStatus } from "../tabs/sensors/sensorStatus";
import { StatusDot } from "../shared/StatusDot";
import { SeverityPill } from "../shared/SeverityPill";
import { buildNarrative, describeSensor } from "./sensorNarrative";
import { ThresholdRail } from "./ThresholdRail";

interface Props {
  selected: TwinHotspotDescriptor | null;
  sensorMap: Map<string, Sensor>;
  equipment: Equipment[];
  sensors: Sensor[];
  insights: AIInsight[];
  alerts: PropertyAlert[];
  workOrders: MaintenanceWorkOrder[];
  onCreateWorkOrder?: (equipmentId: string) => void;
}

export function TwinSidePanel({
  selected,
  sensorMap,
  equipment,
  sensors,
  insights,
  alerts,
  workOrders,
  onCreateWorkOrder,
}: Props) {
  if (!selected) {
    return (
      <aside className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 text-xs text-stone-500 dark:text-stone-400 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-stone-400">Inspector</div>
        <p>Click a hotspot in the twin to see live data, trends, thresholds, and any active AI insights or work orders for that asset.</p>
      </aside>
    );
  }

  if (selected.kind === "sensor" && selected.sensorId) {
    const sensor = sensorMap.get(selected.sensorId);
    if (sensor) {
      return (
        <SensorPanel
          sensor={sensor}
          equipment={equipment}
          insights={insights}
          alerts={alerts}
          onCreateWorkOrder={onCreateWorkOrder}
        />
      );
    }
  }

  if (selected.kind === "equipment" && selected.equipmentId) {
    const eq = equipment.find((e) => e.id === selected.equipmentId);
    if (eq) {
      return (
        <EquipmentPanel
          equipment={eq}
          sensors={sensors.filter((s) => s.equipmentId === eq.id)}
          insights={insights.filter((i) => i.equipmentId === eq.id && i.status !== "resolved")}
          alerts={alerts.filter((a) => a.equipmentId === eq.id && !a.ack)}
          workOrders={workOrders.filter((w) => w.equipmentId === eq.id && w.status !== "closed")}
          onCreateWorkOrder={onCreateWorkOrder}
        />
      );
    }
  }

  return (
    <aside className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4 text-xs">
      <div className="text-[10px] uppercase tracking-wider text-stone-500">{selected.kind}</div>
      <div className="text-sm font-semibold">{selected.label}</div>
    </aside>
  );
}

function SensorPanel({
  sensor,
  equipment,
  insights,
  alerts,
  onCreateWorkOrder,
}: {
  sensor: Sensor;
  equipment: Equipment[];
  insights: AIInsight[];
  alerts: PropertyAlert[];
  onCreateWorkOrder?: (equipmentId: string) => void;
}) {
  const { latest } = useSensorStream(sensor.propertyId, [sensor.id]);
  const reading = latest[sensor.id];
  const status = sensorStatus(sensor, reading?.value);
  const { data: history = [] } = useSensorHistory(sensor.id, "1h");
  const chart = history.map((r) => ({
    t: new Date(r.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    v: r.value,
  }));
  const narrative = buildNarrative(sensor, reading, history, status);
  const eq = sensor.equipmentId ? equipment.find((e) => e.id === sensor.equipmentId) : null;
  const relatedInsights = insights.filter(
    (i) => i.status !== "resolved" && (i.relatedSensorIds.includes(sensor.id) || i.equipmentId === eq?.id)
  );
  const relatedAlerts = alerts.filter((a) => !a.ack && (a.sensorId === sensor.id || a.equipmentId === eq?.id));

  const headlineTone =
    narrative.tone === "crit" ? "bg-red-500/10 border-red-500/40 text-red-500"
    : narrative.tone === "warn" ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
    : narrative.tone === "stale" ? "bg-stone-500/10 border-stone-500/30 text-stone-500"
    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";

  return (
    <aside className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 space-y-4 max-h-[68vh] overflow-y-auto">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
          <StatusDot
            status={status === "nominal" ? "nominal" : status === "warning" ? "warning" : status === "critical" ? "critical" : "offline"}
            pulse={status === "critical"}
          />
          Sensor · {sensor.key}
        </div>
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{sensor.label}</h3>
        {eq && (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            {eq.name}{eq.manufacturer ? ` · ${eq.manufacturer}${eq.model ? " " + eq.model : ""}` : ""}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-bold tabular-nums text-stone-900 dark:text-stone-50 leading-none">
            {reading ? reading.value.toFixed(2) : "—"}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">{sensor.unit || "—"}</div>
        </div>
        <TrendChip delta={narrative.delta5m} unit={sensor.unit} label="5 min" />
      </div>

      <div className={`rounded-lg border p-3 text-xs ${headlineTone}`}>
        <div className="font-semibold">{narrative.headline}</div>
        <p className="mt-1 opacity-90">{narrative.detail}</p>
      </div>

      {(sensor.warnMin !== undefined || sensor.warnMax !== undefined || sensor.critMin !== undefined || sensor.critMax !== undefined) && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Threshold Rail</div>
          <ThresholdRail sensor={sensor} value={reading?.value} />
          {narrative.marginToNextThreshold && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
              <span className="tabular-nums text-stone-700 dark:text-stone-300">
                {narrative.marginToNextThreshold.value.toFixed(2)} {sensor.unit}
              </span>{" "}
              {narrative.marginToNextThreshold.label}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Stat label="1h min" value={narrative.min1h !== null ? narrative.min1h.toFixed(2) : "—"} />
        <Stat label="1h avg" value={narrative.avg1h !== null ? narrative.avg1h.toFixed(2) : "—"} />
        <Stat label="1h max" value={narrative.max1h !== null ? narrative.max1h.toFixed(2) : "—"} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">Last hour</span>
          <TrendChip delta={narrative.delta1h} unit={sensor.unit} label="1h" compact />
        </div>
        <div className="h-28">
          <ResponsiveContainer>
            <LineChart data={chart} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <XAxis dataKey="t" tick={{ fontSize: 9 }} minTickGap={32} tickMargin={4} stroke="currentColor" className="text-stone-500" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9 }} width={36} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              {sensor.warnMax !== undefined && <ReferenceLine y={sensor.warnMax} stroke="#f59e0b" strokeDasharray="3 3" />}
              {sensor.critMax !== undefined && <ReferenceLine y={sensor.critMax} stroke="#ef4444" strokeDasharray="3 3" />}
              {sensor.warnMin !== undefined && <ReferenceLine y={sensor.warnMin} stroke="#f59e0b" strokeDasharray="3 3" />}
              {sensor.critMin !== undefined && <ReferenceLine y={sensor.critMin} stroke="#ef4444" strokeDasharray="3 3" />}
              <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">About this sensor</div>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-snug">{describeSensor(sensor)}</p>
      </div>

      {relatedInsights.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Insights
          </div>
          <ul className="space-y-1.5">
            {relatedInsights.slice(0, 3).map((i) => (
              <li key={i.id} className="rounded-md border border-stone-200 dark:border-stone-800 p-2 text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <SeverityPill severity={i.severity} />
                  <span className="text-[10px] text-stone-500">conf {(i.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="text-stone-800 dark:text-stone-200">{i.title}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedAlerts.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Active alerts</div>
          <ul className="space-y-1">
            {relatedAlerts.slice(0, 3).map((a) => (
              <li key={a.id} className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <SeverityPill severity={a.severity} />
                <span className="truncate">{a.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {eq && onCreateWorkOrder && (
        <Button size="sm" variant="outline" onClick={() => onCreateWorkOrder(eq.id)} className="w-full">
          <Wrench className="w-3.5 h-3.5 mr-1.5" /> Create Work Order
        </Button>
      )}
    </aside>
  );
}

function EquipmentPanel({
  equipment,
  sensors,
  insights,
  alerts,
  workOrders,
  onCreateWorkOrder,
}: {
  equipment: Equipment;
  sensors: Sensor[];
  insights: AIInsight[];
  alerts: PropertyAlert[];
  workOrders: MaintenanceWorkOrder[];
  onCreateWorkOrder?: (equipmentId: string) => void;
}) {
  const { latest } = useSensorStream(equipment.propertyId, sensors.map((s) => s.id));
  const counts = { nominal: 0, warning: 0, critical: 0, offline: 0 };
  for (const s of sensors) {
    const r = latest[s.id];
    const status = !r ? "offline" : sensorStatus(s, r.value);
    counts[status] += 1;
  }

  const warrantyDays = equipment.warrantyEnd
    ? Math.round((new Date(equipment.warrantyEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const warrantyTone =
    warrantyDays === null ? "text-stone-500"
    : warrantyDays < 0 ? "text-red-500"
    : warrantyDays < 90 ? "text-amber-500"
    : "text-emerald-500";

  const worstTone =
    counts.critical > 0 ? "bg-red-500/10 border-red-500/40 text-red-500"
    : counts.warning > 0 ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
    : counts.offline > 0 ? "bg-stone-500/10 border-stone-500/30 text-stone-500"
    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";

  return (
    <aside className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 space-y-4 max-h-[68vh] overflow-y-auto">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">Equipment</div>
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{equipment.name}</h3>
      </div>

      <div className={`rounded-lg border p-3 text-xs ${worstTone}`}>
        <div className="font-semibold">
          {counts.critical > 0 ? `${counts.critical} critical channel${counts.critical > 1 ? "s" : ""}`
          : counts.warning > 0 ? `${counts.warning} channel${counts.warning > 1 ? "s" : ""} in warning`
          : counts.offline > 0 ? `${counts.offline} channel${counts.offline > 1 ? "s" : ""} offline`
          : "All channels nominal"}
        </div>
        <p className="mt-1 opacity-90">
          {sensors.length} sensor{sensors.length !== 1 ? "s" : ""} · {insights.length} open insight{insights.length !== 1 ? "s" : ""} · {workOrders.length} active work order{workOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {equipment.manufacturer && <Row label="Manufacturer" value={equipment.manufacturer} />}
        {equipment.model && <Row label="Model" value={equipment.model} />}
        {equipment.serial && <Row label="Serial" value={<span className="font-mono text-[11px]">{equipment.serial}</span>} />}
        {equipment.installDate && <Row label="Installed" value={equipment.installDate} />}
        {equipment.warrantyEnd && (
          <Row
            label="Warranty"
            value={
              <span className={warrantyTone}>
                {equipment.warrantyEnd}
                {warrantyDays !== null && (warrantyDays < 0 ? " · expired" : ` · ${warrantyDays} d`)}
              </span>
            }
          />
        )}
      </dl>

      {sensors.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Live channels</div>
          <ul className="space-y-1">
            {sensors.slice(0, 8).map((s) => {
              const r = latest[s.id];
              const status = !r ? "offline" : sensorStatus(s, r.value);
              const tone =
                status === "critical" ? "text-red-500"
                : status === "warning" ? "text-amber-500"
                : status === "offline" ? "text-stone-500"
                : "text-stone-700 dark:text-stone-300";
              return (
                <li key={s.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <StatusDot status={status === "nominal" ? "nominal" : status === "warning" ? "warning" : status === "critical" ? "critical" : "offline"} />
                    <span className="truncate">{s.label}</span>
                  </span>
                  <span className={`tabular-nums ${tone}`}>
                    {r ? `${r.value.toFixed(2)} ${s.unit}` : "—"}
                  </span>
                </li>
              );
            })}
            {sensors.length > 8 && (
              <li className="text-[11px] text-stone-500 dark:text-stone-400">+{sensors.length - 8} more</li>
            )}
          </ul>
        </div>
      )}

      {insights.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Insights
          </div>
          <ul className="space-y-1.5">
            {insights.slice(0, 3).map((i) => (
              <li key={i.id} className="rounded-md border border-stone-200 dark:border-stone-800 p-2 text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <SeverityPill severity={i.severity} />
                  <span className="text-[10px] text-stone-500">{i.etaDays !== undefined ? `ETA ~${i.etaDays}d` : ""}</span>
                </div>
                <div className="text-stone-800 dark:text-stone-200">{i.title}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {workOrders.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Active work orders</div>
          <ul className="space-y-1">
            {workOrders.slice(0, 3).map((w) => (
              <li key={w.id} className="text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between gap-2">
                <span className="truncate">{w.title}</span>
                <span className="text-[10px] uppercase text-stone-500">{w.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onCreateWorkOrder && (
        <Button size="sm" variant="outline" onClick={() => onCreateWorkOrder(equipment.id)} className="w-full">
          <Wrench className="w-3.5 h-3.5 mr-1.5" /> Create Work Order
        </Button>
      )}
    </aside>
  );
}

function TrendChip({ delta, unit, label, compact = false }: { delta: number | null; unit: string; label: string; compact?: boolean }) {
  if (delta === null) {
    return <span className="text-[10px] text-stone-500">no Δ</span>;
  }
  const eps = 0.01;
  const Icon = delta > eps ? ArrowUpRight : delta < -eps ? ArrowDownRight : Minus;
  const tone = Math.abs(delta) < eps ? "text-stone-500 bg-stone-500/10 border-stone-500/20"
    : delta > 0 ? "text-sky-500 bg-sky-500/10 border-sky-500/20"
    : "text-sky-500 bg-sky-500/10 border-sky-500/20";
  const sign = delta > 0 ? "+" : "";
  return (
    <div className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] tabular-nums ${tone}`}>
      <Icon className="w-3 h-3" />
      <span>{sign}{delta.toFixed(Math.abs(delta) >= 10 ? 1 : 2)}{unit ? " " + unit : ""}</span>
      {!compact && <span className="text-[9px] uppercase opacity-70">/ {label}</span>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 dark:border-stone-800 p-2">
      <div className="text-[9px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</div>
      <div className="tabular-nums text-sm font-semibold text-stone-900 dark:text-stone-50">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="font-medium text-stone-800 dark:text-stone-200 text-right">{value}</dd>
    </>
  );
}
