import { MockAIAdapter } from "./MockAIAdapter";

export class AnomalyDetectionAdapter extends MockAIAdapter {
  constructor() {
    super("anomaly_detection");
  }
}
