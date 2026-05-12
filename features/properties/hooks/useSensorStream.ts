"use client";

import { useEffect, useMemo, useState } from "react";
import { getSensorAdapter } from "../adapters/factory";
import type { SensorReading } from "../types";

export interface SensorStreamState {
  latest: Record<string, SensorReading>;
  sparklines: Record<string, number[]>;
  error: Error | null;
}

const MAX_SPARKLINE = 30;

export function useSensorStream(
  propertyId: string | undefined,
  sensorIds: string[]
): SensorStreamState {
  const [latest, setLatest] = useState<Record<string, SensorReading>>({});
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [error, setError] = useState<Error | null>(null);
  const idsKey = useMemo(() => sensorIds.slice().sort().join("|"), [sensorIds]);
  const stableIds = useMemo(() => sensorIds.slice(), [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!propertyId || stableIds.length === 0) return;
    const adapter = getSensorAdapter();
    let cancelled = false;

    adapter
      .latest(stableIds)
      .then((seed) => {
        if (cancelled) return;
        setLatest((l) => ({ ...l, ...seed }));
        setSparklines((s) => {
          const next = { ...s };
          for (const id of stableIds) {
            const v = seed[id]?.value;
            if (v !== undefined) next[id] = [v];
          }
          return next;
        });
      })
      .catch((e) => !cancelled && setError(e as Error));

    let sub: { unsubscribe(): void } | null = null;
    try {
      sub = adapter.subscribe(propertyId, stableIds, (r) => {
        setLatest((l) => ({ ...l, [r.sensorId]: r }));
        setSparklines((s) => {
          const cur = s[r.sensorId] ?? [];
          const next = cur.concat(r.value);
          if (next.length > MAX_SPARKLINE) next.shift();
          return { ...s, [r.sensorId]: next };
        });
      });
    } catch (e) {
      setError(e as Error);
    }

    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, [propertyId, stableIds]);

  return { latest, sparklines, error };
}
