"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IotMetric } from "@/types/bms";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Thermometer,
  Droplets,
  Zap,
  Wind,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GaugeChart } from "./GaugeChart";
import {
  getMetricIcon,
  getSeverityIcon,
  getLatestMetricByType,
  prepareChartData,
} from "../utils/iotMetricsHelpers";
import { getTimeAgo } from "../utils/companyHelpers";

interface IotMetricsDashboardProps {
  metrics: IotMetric[];
  loading: boolean;
  onRefresh: () => void;
}

export function IotMetricsDashboard({
  metrics,
  loading,
  onRefresh,
}: IotMetricsDashboardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-gray-600">Loading IoT metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No IoT Metrics Available
          </h3>
          <p className="text-gray-600">
            This company does not have any IoT metrics recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const temp = getLatestMetricByType(metrics, "temp");
  const humidity = getLatestMetricByType(metrics, "humidity");
  const power = getLatestMetricByType(metrics, "power");
  const pressure = getLatestMetricByType(metrics, "pressure");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              IoT Metrics Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Real-time monitoring and analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{metrics.length} metrics</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Alert Summary Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            System Status Overview
          </CardTitle>
          <p className="text-sm text-gray-600">
            Current alert status across all IoT devices
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatusCard
              icon={<Activity className="w-6 h-6 text-white" />}
              bgColor="bg-blue-500"
              label="Total Metrics"
              value={metrics.length}
              description="Data Points"
            />
            <StatusCard
              icon={<CheckCircle2 className="w-6 h-6 text-white" />}
              bgColor="bg-green-500"
              label="Normal Status"
              value={metrics.filter((m) => !m.alertTriggered).length}
              description="No Issues"
            />
            <StatusCard
              icon={<AlertTriangle className="w-6 h-6 text-white" />}
              bgColor="bg-yellow-500"
              label="Warning Alerts"
              value={metrics.filter((m) => m.alertSeverity === "warning").length}
              description="Requires Attention"
            />
            <StatusCard
              icon={<AlertTriangle className="w-6 h-6 text-white" />}
              bgColor="bg-red-500"
              label="Critical Alerts"
              value={metrics.filter((m) => m.alertSeverity === "critical").length}
              description="Immediate Action"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Readings */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Current Readings
          </h3>
          <p className="text-sm text-gray-600">
            Latest values from IoT sensors
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {temp && (
            <MetricCard
              icon={<Thermometer className="w-5 h-5 text-orange-600" />}
              label="Temperature"
              metric={temp}
              gradientFrom="from-orange-50"
              gradientTo="to-red-50"
              borderColor="border-orange-200"
              labelColor="text-orange-700"
            />
          )}
          {humidity && (
            <MetricCard
              icon={<Droplets className="w-5 h-5 text-blue-600" />}
              label="Humidity"
              metric={humidity}
              gradientFrom="from-blue-50"
              gradientTo="to-cyan-50"
              borderColor="border-blue-200"
              labelColor="text-blue-700"
            />
          )}
          {power && (
            <MetricCard
              icon={<Zap className="w-5 h-5 text-yellow-600" />}
              label="Power"
              metric={power}
              gradientFrom="from-yellow-50"
              gradientTo="to-amber-50"
              borderColor="border-yellow-200"
              labelColor="text-yellow-700"
            />
          )}
          {pressure && (
            <MetricCard
              icon={<Wind className="w-5 h-5 text-purple-600" />}
              label="Pressure"
              metric={pressure}
              gradientFrom="from-purple-50"
              gradientTo="to-pink-50"
              borderColor="border-purple-200"
              labelColor="text-purple-700"
            />
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Visual Analytics
          </h3>
          <p className="text-sm text-gray-600">
            Gauge meters and trend analysis
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauge Charts */}
          {[...new Set(metrics.map((m) => m.metricType))]
            .slice(0, 2)
            .map((type) => {
              const latest = getLatestMetricByType(metrics, type);
              if (!latest) return null;

              const max = latest.thresholdMax || 100;
              const color = latest.alertTriggered
                ? latest.alertSeverity === "critical"
                  ? "#ef4444"
                  : "#f59e0b"
                : "#3b82f6";

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {getMetricIcon(type)}
                      {type} - Gauge Meter
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Current value: {latest.value.toFixed(1)} {latest.unit}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <GaugeChart
                        value={latest.value}
                        max={max}
                        label="Current Value"
                        unit={latest.unit}
                        color={color}
                      />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Min: 0</span>
                        <span className="text-gray-600">Max: {max}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

          {/* Line Chart - Trends */}
          <TrendChart metrics={metrics} />
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <MetricsTable metrics={metrics} />
    </div>
  );
}

function StatusCard({
  icon,
  bgColor,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`p-3 ${bgColor} rounded-xl`}>{icon}</div>
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  metric,
  gradientFrom,
  gradientTo,
  borderColor,
  labelColor,
}: {
  icon: React.ReactNode;
  label: string;
  metric: IotMetric;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  labelColor: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className={`text-xs font-medium ${labelColor} uppercase tracking-wide`}>
              {label}
            </span>
          </div>
          {metric.alertTriggered && (
            <Badge
              variant="outline"
              className={
                metric.alertSeverity === "critical"
                  ? "bg-red-100 text-red-700 border-red-300"
                  : "bg-yellow-100 text-yellow-700 border-yellow-300"
              }
            >
              Alert
            </Badge>
          )}
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {metric.value.toFixed(1)}
          <span className="text-lg text-gray-600 ml-1">
            {metric.unit || ""}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-700">
          {metric.metricType}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Last Updated: {getTimeAgo(metric.timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendChart({ metrics }: { metrics: IotMetric[] }) {
  const metricTypes = [...new Set(metrics.map((m) => m.metricType))];
  const primaryType = metricTypes[0];

  if (!primaryType) return null;

  const chartData = prepareChartData(metrics, primaryType);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trend Analysis - {primaryType}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Historical data showing last 20 readings over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time Period</span>
            <span className="font-medium text-gray-900">
              Last {chartData.length} readings
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              label={{ value: "Time", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              label={{ value: "Value", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px",
              }}
              formatter={(value: number) => [value, "Value"]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Metric Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MetricsTable({ metrics }: { metrics: IotMetric[] }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Detailed Metrics List
        </h3>
        <p className="text-sm text-gray-600">
          Complete information for all sensor readings
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Metrics Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.slice(0, 10).map((metric) => (
              <div
                key={metric.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  metric.alertTriggered
                    ? metric.alertSeverity === "critical"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        metric.alertTriggered ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      {getMetricIcon(metric.metricType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Metric Type:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.metricType}
                        </span>
                        {metric.alertTriggered && (
                          <Badge
                            variant="outline"
                            className={
                              metric.alertSeverity === "critical"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-yellow-100 text-yellow-700 border-yellow-300"
                            }
                          >
                            {getSeverityIcon(metric.alertSeverity)}
                            <span className="ml-1 uppercase text-xs">
                              {metric.alertSeverity}
                            </span>
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Device ID:</span>{" "}
                        {metric.deviceId.slice(0, 8)}... •{" "}
                        <span className="font-medium">Recorded:</span>{" "}
                        {getTimeAgo(metric.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Current Value
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {metric.value.toFixed(2)}
                    </div>
                    {metric.unit && (
                      <div className="text-sm text-gray-600 font-medium">
                        {metric.unit}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {metrics.length > 10 && (
            <div className="text-center pt-4 mt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing 10 of {metrics.length} metrics
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
