import type { HistoryRange, Sensor, SensorReading } from "../types";
import {
  getSensorById,
  getSensorsByProperty,
} from "../mock/sensors";
import {
  createStreamState,
  nextReading,
  type GeneratorState,
} from "../mock/generators/streamGenerator";
import { maybeInjectAnomaly } from "../mock/generators/anomalyInjector";
import type { SensorStream, Subscription } from "./contracts";

const TICK_MS = 1500;
const RING_SIZE = 600;

type Ring = { buf: SensorReading[]; state: GeneratorState; sensor: Sensor };

class MockSensorAdapterImpl implements SensorStream {
  private rings = new Map<string, Ring>();
  private listeners = new Map<string, Set<(r: SensorReading) => void>>();
  private timer: ReturnType<typeof setInterval> | null = null;

  private ensureRing(sensorId: string): Ring | null {
    const existing = this.rings.get(sensorId);
    if (existing) return existing;
    const sensor = getSensorById(sensorId);
    if (!sensor) return null;
    const ring: Ring = { buf: [], state: createStreamState(sensor), sensor };
    this.rings.set(sensorId, ring);
    return ring;
  }

  private ensureTimer(): void {
    if (this.timer) return;
    if (typeof window === "undefined") return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private tick(): void {
    for (const [sensorId, ring] of this.rings.entries()) {
      maybeInjectAnomaly(ring.sensor, ring.state);
      const reading = nextReading(ring.sensor, ring.state);
      ring.buf.push(reading);
      if (ring.buf.length > RING_SIZE) ring.buf.shift();
      const ls = this.listeners.get(sensorId);
      if (ls) ls.forEach((cb) => cb(reading));
    }
  }

  subscribe(
    _propertyId: string,
    sensorIds: string[],
    onReading: (r: SensorReading) => void
  ): Subscription {
    for (const id of sensorIds) {
      this.ensureRing(id);
      let set = this.listeners.get(id);
      if (!set) {
        set = new Set();
        this.listeners.set(id, set);
      }
      set.add(onReading);
    }
    this.ensureTimer();
    return {
      unsubscribe: () => {
        for (const id of sensorIds) {
          const set = this.listeners.get(id);
          if (!set) continue;
          set.delete(onReading);
          if (set.size === 0) this.listeners.delete(id);
        }
      },
    };
  }

  async latest(sensorIds: string[]): Promise<Record<string, SensorReading>> {
    const out: Record<string, SensorReading> = {};
    for (const id of sensorIds) {
      const ring = this.ensureRing(id);
      if (!ring) continue;
      if (ring.buf.length === 0) {
        maybeInjectAnomaly(ring.sensor, ring.state);
        ring.buf.push(nextReading(ring.sensor, ring.state));
      }
      out[id] = ring.buf[ring.buf.length - 1];
    }
    return out;
  }

  async history(sensorId: string, range: HistoryRange): Promise<SensorReading[]> {
    const ring = this.ensureRing(sensorId);
    if (!ring) return [];
    const points =
      range === "1h" ? 240 : range === "24h" ? 288 : range === "7d" ? 336 : 360;
    const stepMs =
      range === "1h"
        ? 15_000
        : range === "24h"
        ? 5 * 60_000
        : range === "7d"
        ? 30 * 60_000
        : 2 * 60 * 60_000;
    const out: SensorReading[] = [];
    const tmp: GeneratorState = { ...ring.state, t: 0 };
    const now = Date.now();
    for (let i = points - 1; i >= 0; i--) {
      const r = nextReading(ring.sensor, tmp);
      out.push({ ...r, ts: now - i * stepMs });
    }
    return out;
  }

  prefetchProperty(propertyId: string): void {
    for (const s of getSensorsByProperty(propertyId)) this.ensureRing(s.id);
  }
}

let instance: MockSensorAdapterImpl | null = null;
export function getMockSensorAdapter(): MockSensorAdapterImpl {
  if (!instance) instance = new MockSensorAdapterImpl();
  return instance;
}
