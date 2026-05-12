import type { Sensor, SensorReading } from "../../types";

export interface GeneratorState {
  t: number;
  baseline: number;
  driftPerTick: number;
  anomalyActive: boolean;
  anomalyMagnitude: number;
}

function sensorBaseline(sensor: Sensor): number {
  switch (sensor.key) {
    case "vibration_x":
    case "vibration_y":
    case "vibration_z":
      return 3.2;
    case "bearing_temp":
      return 78;
    case "oil_pressure":
      return 4.6;
    case "exhaust_temp":
      return 480;
    case "rpm":
      return 1500;
    case "load_kw":
      return 1750;
    case "fuel_flow":
      return 420;
    case "coolant_temp":
      return 84;
    case "grid_freq":
      return 60.0;
    case "switchgear_temp":
      return 52;
    case "load_pct":
      return 68;
    case "supply_temp":
      return 14;
    case "return_temp":
      return 24;
    case "suction_p":
      return 1.8;
    case "fire_zone_status":
      return 0;
    default:
      return 50;
  }
}

function sensorNoise(sensor: Sensor): number {
  switch (sensor.key) {
    case "vibration_x":
    case "vibration_y":
    case "vibration_z":
      return 0.35;
    case "bearing_temp":
    case "coolant_temp":
      return 0.6;
    case "oil_pressure":
      return 0.05;
    case "exhaust_temp":
      return 6;
    case "rpm":
      return 3;
    case "load_kw":
      return 25;
    case "fuel_flow":
      return 5;
    case "grid_freq":
      return 0.01;
    case "switchgear_temp":
      return 0.4;
    case "load_pct":
      return 1.5;
    case "supply_temp":
    case "return_temp":
      return 0.4;
    case "suction_p":
      return 0.03;
    default:
      return 1;
  }
}

function gauss(): number {
  const u = Math.random() || 1e-9;
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function isDegradingSensor(sensor: Sensor): boolean {
  return (
    sensor.equipmentId === "eq-engine-2" &&
    (sensor.key === "vibration_x" ||
      sensor.key === "vibration_y" ||
      sensor.key === "bearing_temp")
  );
}

export function createStreamState(sensor: Sensor): GeneratorState {
  return {
    t: 0,
    baseline: sensorBaseline(sensor),
    driftPerTick: isDegradingSensor(sensor) ? 0.0008 : 0,
    anomalyActive: false,
    anomalyMagnitude: 0,
  };
}

export function nextReading(sensor: Sensor, state: GeneratorState): SensorReading {
  state.t += 1;
  const noise = sensorNoise(sensor);
  const period = 60;
  const wave = Math.sin((state.t / period) * Math.PI * 2) * noise * 0.4;
  const drift = state.driftPerTick * state.t;
  const anomaly = state.anomalyActive ? state.anomalyMagnitude : 0;
  let value = state.baseline + wave + drift + anomaly + gauss() * noise;

  if (sensor.key === "fire_zone_status") {
    value = 0;
  }
  if (sensor.key === "grid_freq") {
    value = 60 + gauss() * 0.02;
  }

  return {
    sensorId: sensor.id,
    ts: Date.now(),
    value: Math.round(value * 1000) / 1000,
    quality: "good",
  };
}
