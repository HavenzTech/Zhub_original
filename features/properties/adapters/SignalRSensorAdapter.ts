import type { HistoryRange, SensorReading } from "../types";
import {
  NotImplementedError,
  type SensorStream,
  type Subscription,
} from "./contracts";

export class SignalRSensorAdapter implements SensorStream {
  constructor(private hubUrl: string = "/hubs/sensors") {}

  subscribe(
    _propertyId: string,
    _sensorIds: string[],
    _onReading: (r: SensorReading) => void
  ): Subscription {
    throw new NotImplementedError(`SignalR sensor stream (${this.hubUrl})`);
  }

  latest(_sensorIds: string[]): Promise<Record<string, SensorReading>> {
    throw new NotImplementedError("SignalR latest()");
  }

  history(_sensorId: string, _range: HistoryRange): Promise<SensorReading[]> {
    throw new NotImplementedError("SignalR history()");
  }
}
