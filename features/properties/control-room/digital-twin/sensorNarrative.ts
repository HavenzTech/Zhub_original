import type { Sensor, SensorReading, SensorStatus } from "../../types";

export const SENSOR_KEY_DESCRIPTIONS: Record<string, string> = {
  vibration_x: "Radial vibration amplitude on the X axis. Sustained increase indicates bearing wear, misalignment, or imbalance.",
  vibration_y: "Radial vibration amplitude on the Y axis. Correlate with X/Z to identify rotating-fault direction.",
  vibration_z: "Axial vibration amplitude. Spikes suggest thrust-bearing degradation or coupling issues.",
  bearing_temp: "Main bearing temperature. Creeping rise is an early signal of lubrication breakdown or incipient failure.",
  oil_pressure: "Lubrication oil pressure at the gallery. Low pressure starves bearings; high pressure suggests filter restriction.",
  exhaust_temp: "Post-combustion exhaust gas temperature. High deviation between cylinders indicates combustion imbalance.",
  rpm: "Rotational speed. Should track grid frequency ±0.3%. Hunting suggests governor instability.",
  load_kw: "Active electrical output. Compare to nameplate; sagging output at constant fuel signals efficiency loss.",
  fuel_flow: "Fuel input rate. Drift versus load indicates injector fouling or BTU variation.",
  coolant_temp: "Jacket-water temperature. Outliers reveal radiator, pump, or thermostat faults.",
  grid_freq: "Interconnection frequency. Deviation outside 59.8–60.2 Hz risks synchroscope trip and islanding.",
  switchgear_temp: "Bus / cubicle temperature. Hot spots precede insulation failure and arc-flash events.",
  fire_zone_status: "Aggregated fire-alarm zone state. Non-zero = active event.",
  load_pct: "Equipment load as percent of rated capacity.",
  supply_temp: "Supply-air temperature delivered downstream.",
  return_temp: "Return-air temperature. Elevated return indicates rising heat load.",
  suction_p: "Compressor suction pressure. Low values point to refrigerant loss or restriction.",
};

export function describeSensor(sensor: Sensor): string {
  return (
    SENSOR_KEY_DESCRIPTIONS[sensor.key] ||
    `${sensor.label} — monitored for deviations against configured thresholds.`
  );
}

export interface SensorNarrative {
  headline: string;
  tone: "ok" | "warn" | "crit" | "stale";
  detail: string;
  delta5m: number | null;
  delta1h: number | null;
  min1h: number | null;
  max1h: number | null;
  avg1h: number | null;
  marginToNextThreshold: { value: number; label: string } | null;
}

function fmt(n: number, unit: string): string {
  const abs = Math.abs(n);
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return `${n.toFixed(decimals)}${unit ? " " + unit : ""}`;
}

export function buildNarrative(
  sensor: Sensor,
  current: SensorReading | undefined,
  history: SensorReading[] | undefined,
  status: SensorStatus
): SensorNarrative {
  if (!current || status === "offline") {
    return {
      headline: "Sensor offline or stale",
      tone: "stale",
      detail: "No recent reading received. Check network, gateway, or power to the sensor.",
      delta5m: null,
      delta1h: null,
      min1h: null,
      max1h: null,
      avg1h: null,
      marginToNextThreshold: null,
    };
  }

  const v = current.value;
  const now = current.ts;
  const hist = history ?? [];

  const pickNear = (ms: number) => {
    if (hist.length === 0) return null;
    const target = now - ms;
    let best = hist[0];
    let bestDiff = Math.abs(hist[0].ts - target);
    for (const r of hist) {
      const d = Math.abs(r.ts - target);
      if (d < bestDiff) { best = r; bestDiff = d; }
    }
    return best.value;
  };

  const v5 = pickNear(5 * 60_000);
  const v1h = pickNear(60 * 60_000);
  const delta5m = v5 !== null ? v - v5 : null;
  const delta1h = v1h !== null ? v - v1h : null;

  const values1h = hist.length > 0 ? hist.map((r) => r.value) : [v];
  const min1h = Math.min(...values1h);
  const max1h = Math.max(...values1h);
  const avg1h = values1h.reduce((s, x) => s + x, 0) / values1h.length;

  let marginToNextThreshold: SensorNarrative["marginToNextThreshold"] = null;
  if (sensor.critMax !== undefined && v < sensor.critMax) {
    marginToNextThreshold = { value: sensor.critMax - v, label: `to critical (${sensor.critMax} ${sensor.unit})` };
  } else if (sensor.warnMax !== undefined && v < sensor.warnMax) {
    marginToNextThreshold = { value: sensor.warnMax - v, label: `to warning (${sensor.warnMax} ${sensor.unit})` };
  } else if (sensor.critMin !== undefined && v > sensor.critMin) {
    marginToNextThreshold = { value: v - sensor.critMin, label: `above critical-min (${sensor.critMin} ${sensor.unit})` };
  } else if (sensor.warnMin !== undefined && v > sensor.warnMin) {
    marginToNextThreshold = { value: v - sensor.warnMin, label: `above warn-min (${sensor.warnMin} ${sensor.unit})` };
  }

  const trendWord =
    delta1h === null ? "steady"
    : Math.abs(delta1h) < (avg1h * 0.005) ? "steady"
    : delta1h > 0 ? "trending up"
    : "trending down";

  if (status === "critical") {
    const why =
      sensor.critMax !== undefined && v > sensor.critMax ? `above critical-max (${sensor.critMax} ${sensor.unit})`
      : sensor.critMin !== undefined && v < sensor.critMin ? `below critical-min (${sensor.critMin} ${sensor.unit})`
      : "outside critical band";
    return {
      headline: `CRITICAL — reading ${why}`,
      tone: "crit",
      detail: `Current ${fmt(v, sensor.unit)}, ${trendWord} over last hour (${delta1h !== null ? (delta1h > 0 ? "+" : "") + fmt(delta1h, sensor.unit) : "—"}). Immediate review recommended.`,
      delta5m, delta1h, min1h, max1h, avg1h, marginToNextThreshold,
    };
  }

  if (status === "warning") {
    return {
      headline: "Warning — reading outside nominal band",
      tone: "warn",
      detail: `Current ${fmt(v, sensor.unit)}, ${trendWord}. Not yet critical, but investigate if the trend continues.`,
      delta5m, delta1h, min1h, max1h, avg1h, marginToNextThreshold,
    };
  }

  return {
    headline: "Nominal",
    tone: "ok",
    detail: `Current ${fmt(v, sensor.unit)}, ${trendWord}. 1h range ${fmt(min1h, sensor.unit)} – ${fmt(max1h, sensor.unit)}, avg ${fmt(avg1h, sensor.unit)}.`,
    delta5m, delta1h, min1h, max1h, avg1h, marginToNextThreshold,
  };
}
