import {
  Thermometer,
  Droplets,
  Zap,
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { IotMetric } from "@/types/bms";

export function getMetricIcon(metricType: string) {
  const type = metricType.toLowerCase();
  if (type.includes("temp")) return <Thermometer className="w-5 h-5" />;
  if (type.includes("humidity") || type.includes("moisture"))
    return <Droplets className="w-5 h-5" />;
  if (
    type.includes("power") ||
    type.includes("energy") ||
    type.includes("voltage")
  )
    return <Zap className="w-5 h-5" />;
  if (type.includes("air") || type.includes("wind"))
    return <Wind className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
}

export function getSeverityColor(severity?: string) {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getSeverityIcon(severity?: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="w-4 h-4" />;
    case "warning":
      return <Info className="w-4 h-4" />;
    case "info":
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return null;
  }
}

export function groupMetricsByType(metrics: IotMetric[]) {
  const grouped: { [key: string]: IotMetric[] } = {};
  metrics.forEach((metric) => {
    const type = metric.metricType;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(metric);
  });
  return grouped;
}

export function getLatestMetricByType(metrics: IotMetric[], type: string) {
  const filtered = metrics.filter((m) =>
    m.metricType?.toLowerCase().includes(type.toLowerCase())
  );
  if (filtered.length === 0) return null;
  return filtered.sort(
    (a, b) =>
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  )[0];
}

export function prepareChartData(metrics: IotMetric[], metricType: string) {
  return metrics
    .filter((m) => m.metricType === metricType)
    .sort(
      (a, b) =>
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    )
    .slice(-20)
    .map((m) => ({
      time: new Date(m.timestamp || 0).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: m.value,
      alert: m.alertTriggered,
    }));
}
