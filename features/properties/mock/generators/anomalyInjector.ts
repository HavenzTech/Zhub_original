import type { Sensor } from "../../types";
import type { GeneratorState } from "./streamGenerator";

export function maybeInjectAnomaly(sensor: Sensor, state: GeneratorState): void {
  if (state.anomalyActive) {
    if (Math.random() < 0.02) {
      state.anomalyActive = false;
      state.anomalyMagnitude = 0;
    }
    return;
  }
  const base = sensor.critical ? 0.0008 : 0.0003;
  if (Math.random() < base) {
    state.anomalyActive = true;
    const sign = Math.random() < 0.5 ? -1 : 1;
    const magnitudeBase = Math.max(
      Math.abs((sensor.warnMax ?? state.baseline * 1.1) - state.baseline),
      state.baseline * 0.08
    );
    state.anomalyMagnitude = sign * magnitudeBase * (1 + Math.random());
  }
}
