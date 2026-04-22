import { describe, expect, it } from "vitest";
import { getMockSensorAdapter } from "../MockSensorAdapter";
import { mockSensors } from "../../mock/sensors";

describe("SensorStream contract — MockSensorAdapter", () => {
  it("latest() returns a reading for each requested sensor id", async () => {
    const adapter = getMockSensorAdapter();
    const ids = mockSensors.slice(0, 5).map((s) => s.id);
    const latest = await adapter.latest(ids);
    for (const id of ids) {
      expect(latest[id]).toBeDefined();
      expect(typeof latest[id].value).toBe("number");
      expect(latest[id].sensorId).toBe(id);
    }
  });

  it("history() returns a time-ordered series", async () => {
    const adapter = getMockSensorAdapter();
    const sensor = mockSensors[0];
    const hist = await adapter.history(sensor.id, "1h");
    expect(hist.length).toBeGreaterThan(0);
    for (let i = 1; i < hist.length; i++) {
      expect(hist[i].ts).toBeGreaterThanOrEqual(hist[i - 1].ts);
    }
  });

  it("unsubscribe() stops delivering readings", async () => {
    const adapter = getMockSensorAdapter();
    const sensor = mockSensors[0];
    let count = 0;
    const sub = adapter.subscribe(sensor.propertyId, [sensor.id], () => { count += 1; });
    sub.unsubscribe();
    const before = count;
    await new Promise((r) => setTimeout(r, 50));
    expect(count).toBe(before);
  });
});
