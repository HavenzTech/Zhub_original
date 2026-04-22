import type { Sensor, SensorStatus } from "../../../types";

export function sensorStatus(sensor: Sensor, value: number | undefined): SensorStatus {
  if (value === undefined || Number.isNaN(value)) return "offline";
  const { warnMin, warnMax, critMin, critMax } = sensor;
  if ((critMin !== undefined && value < critMin) || (critMax !== undefined && value > critMax)) {
    return "critical";
  }
  if ((warnMin !== undefined && value < warnMin) || (warnMax !== undefined && value > warnMax)) {
    return "warning";
  }
  return "nominal";
}
