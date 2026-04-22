import { describe, expect, it } from "vitest";
import { createStreamState, isDegradingSensor, nextReading } from "../generators/streamGenerator";
import { mockSensors } from "../sensors";
import { getHealthForProperty } from "../health";
import { FLAGSHIP_PROPERTY_ID } from "../properties";

describe("stream generator", () => {
  it("emits bounded, numeric values", () => {
    const s = mockSensors.find((x) => x.key === "bearing_temp")!;
    const state = createStreamState(s);
    for (let i = 0; i < 20; i++) {
      const r = nextReading(s, state);
      expect(Number.isFinite(r.value)).toBe(true);
      expect(r.quality).toBe("good");
    }
  });

  it("flags Engine 2 vibration/bearing as degrading", () => {
    const vib = mockSensors.find((s) => s.id === "sen-eng2-vib-x")!;
    const bear = mockSensors.find((s) => s.id === "sen-eng2-bearing-t")!;
    expect(isDegradingSensor(vib)).toBe(true);
    expect(isDegradingSensor(bear)).toBe(true);
  });
});

describe("health composite", () => {
  it("computes a flagship property score between 0 and 100", () => {
    const h = getHealthForProperty(FLAGSHIP_PROPERTY_ID);
    expect(h.score).toBeGreaterThanOrEqual(0);
    expect(h.score).toBeLessThanOrEqual(100);
    expect(h.components.systems).toBeGreaterThanOrEqual(0);
    expect(h.components.sensors).toBeGreaterThanOrEqual(0);
    expect(h.components.ai).toBeGreaterThanOrEqual(0);
    expect(h.components.maintenance).toBeGreaterThanOrEqual(0);
  });
});
