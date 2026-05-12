"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Property } from "@/types/bms";
import type {
  AIInsight,
  Equipment,
  PropertyAlert,
  PropertyHealthScore,
  Sensor,
  SensorStatus,
} from "../types";
import { HealthGauge } from "./shared/HealthGauge";
import { SeverityPill } from "./shared/SeverityPill";
import { StatusDot } from "./shared/StatusDot";
import { Timestamp } from "./shared/Timestamp";
import { CameraTile } from "./tabs/security/CameraTile";
import { CameraDialog } from "./tabs/security/CameraDialog";
import { getAccessEventsByCamera, getCamerasByProperty } from "../mock/security";
import { getTypeIcon } from "../utils/propertyHelpers";
import { useSensorStream } from "../hooks/useSensorStream";
import { sensorStatus } from "./tabs/sensors/sensorStatus";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import type { SecurityCamera } from "../types";

interface Props {
  property: Property;
  health: PropertyHealthScore;
  alerts: PropertyAlert[];
  insights: AIInsight[];
  sensors: Sensor[];
  equipment: Equipment[];
}

const WORST: Record<SensorStatus, number> = { critical: 0, warning: 1, offline: 2, nominal: 3 };

export function MobileControlRoom({ property, health, alerts, insights, sensors, equipment }: Props) {
  const router = useRouter();
  const topSensorIds = useMemo(() => sensors.filter((s) => s.critical).slice(0, 20).map((s) => s.id), [sensors]);
  const { latest } = useSensorStream(property.id as string, topSensorIds);

  const rankedCritical = useMemo(() => {
    const withStatus = sensors
      .filter((s) => s.critical)
      .map((s) => {
        const r = latest[s.id];
        const status = !r ? "offline" : sensorStatus(s, r.value);
        return { sensor: s, reading: r, status };
      })
      .sort((a, b) => WORST[a.status as SensorStatus] - WORST[b.status as SensorStatus]);
    return withStatus.slice(0, 6);
  }, [sensors, latest]);

  const openAlerts = alerts.filter((a) => !a.ack);
  const criticalAlerts = openAlerts.filter((a) => a.severity === "critical");
  const openInsights = insights.filter((i) => i.status !== "resolved");

  const cameras = useMemo(() => getCamerasByProperty(property.id as string), [property.id]);
  const [selectedCam, setSelectedCam] = useState<SecurityCamera | null>(null);

  return (
    <div className="lg:hidden space-y-4 pb-12">
      <header className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0">
          {getTypeIcon(property.type)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{property.status}</div>
          <h1 className="text-base font-semibold text-stone-900 dark:text-stone-50 truncate">{property.name}</h1>
          {(property.locationCity || property.locationProvince) && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {[property.locationCity, property.locationProvince].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </header>

      <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
        <div className="flex items-center justify-between gap-4">
          <HealthGauge score={health.score} size="lg" label="Health" />
          <div className="text-right">
            <div className={`text-2xl font-bold tabular-nums ${criticalAlerts.length > 0 ? "text-red-500" : openAlerts.length > 0 ? "text-amber-500" : "text-stone-500"}`}>
              {openAlerts.length}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">
              open · {criticalAlerts.length} crit
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-[10px]">
          {(["systems", "sensors", "ai", "maintenance"] as const).map((k) => (
            <div key={k} className="rounded-md border border-stone-200 dark:border-stone-800 p-1.5 text-center">
              <div className="tabular-nums font-semibold text-stone-900 dark:text-stone-50">{health.components[k]}</div>
              <div className="uppercase tracking-wide text-stone-500 dark:text-stone-400 text-[9px]">{k}</div>
            </div>
          ))}
        </div>
      </section>

      {openAlerts.length > 0 && (
        <section>
          <SectionHead title="Active alerts" count={openAlerts.length} />
          <ul className="mt-2 space-y-1.5">
            {openAlerts.slice(0, 5).map((a) => (
              <li key={a.id} className="rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-2.5 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityPill severity={a.severity} />
                  <Timestamp ts={a.ts} property={property} mode="time" className="text-[10px] text-stone-500 dark:text-stone-400" />
                </div>
                <p className="text-stone-700 dark:text-stone-300">{a.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {openInsights.length > 0 && (
        <section>
          <SectionHead title="AI insights" count={openInsights.length} icon={<Sparkles className="w-3.5 h-3.5" />} />
          <ul className="mt-2 space-y-1.5">
            {openInsights.slice(0, 4).map((i) => (
              <li key={i.id} className="rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-2.5 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityPill severity={i.severity} />
                  {i.etaDays !== undefined && <span className="text-[10px] text-stone-500">ETA ~{i.etaDays}d</span>}
                </div>
                <p className="font-medium text-stone-800 dark:text-stone-200">{i.title}</p>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">{i.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rankedCritical.length > 0 && (
        <section>
          <SectionHead title="Top critical sensors" count={rankedCritical.length} />
          <ul className="mt-2 space-y-1.5">
            {rankedCritical.map(({ sensor, reading, status }) => {
              const eq = equipment.find((e) => e.id === sensor.equipmentId);
              const tone =
                status === "critical" ? "text-red-500"
                : status === "warning" ? "text-amber-500"
                : status === "offline" ? "text-stone-500"
                : "text-stone-700 dark:text-stone-300";
              return (
                <li key={sensor.id} className="rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-2.5 flex items-center gap-3 text-xs">
                  <StatusDot status={status === "nominal" ? "nominal" : status === "warning" ? "warning" : status === "critical" ? "critical" : "offline"} pulse={status === "critical"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-stone-800 dark:text-stone-200">{sensor.label}</div>
                    {eq && <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{eq.name}</div>}
                  </div>
                  <div className={`tabular-nums font-semibold ${tone}`}>
                    {reading ? `${reading.value.toFixed(2)} ${sensor.unit}` : "—"}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {cameras.length > 0 && (
        <section>
          <SectionHead title="Security feeds" count={cameras.length} />
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cameras.slice(0, 4).map((c) => (
              <CameraTile key={c.id} camera={c} onExpand={() => setSelectedCam(c)} compact />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4 text-sm text-stone-700 dark:text-stone-300">
        <p className="text-xs font-medium mb-1 text-stone-900 dark:text-stone-50">Need the full control room?</p>
        <p className="text-[11px] mb-3 text-stone-600 dark:text-stone-400">The digital twin, sensor grid, financials, and maintenance queue are optimized for larger screens.</p>
        <Link
          href={`/properties/${property.id}?tab=twin`}
          className="inline-flex items-center gap-1.5 text-accent-cyan text-xs font-semibold"
        >
          Open full view on desktop <ExternalLink className="w-3 h-3" />
        </Link>
        <button
          onClick={() => router.push("/properties")}
          className="ml-4 inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs"
        >
          <ArrowRight className="w-3 h-3" /> Portfolio
        </button>
      </section>

      <CameraDialog
        camera={selectedCam}
        events={selectedCam ? getAccessEventsByCamera(selectedCam.id) : []}
        onClose={() => setSelectedCam(null)}
      />
    </div>
  );
}

function SectionHead({ title, count, icon }: { title: string; count?: number; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
      {icon}
      {title}
      {count !== undefined && <span className="tabular-nums text-stone-600 dark:text-stone-300">· {count}</span>}
    </h2>
  );
}
