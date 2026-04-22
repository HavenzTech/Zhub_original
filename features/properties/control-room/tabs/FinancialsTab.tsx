"use client";

import type { Property } from "@/types/bms";
import { usePropertyFinancials } from "../../hooks/usePropertyFinancials";
import { formatCurrency } from "../../utils/propertyHelpers";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function FinancialsTab({ property }: { property: Property }) {
  const { data = [] } = usePropertyFinancials(property.id as string);
  if (data.length === 0) return <div className="text-xs text-stone-500 dark:text-stone-400">Loading financials…</div>;
  const last = data[data.length - 1];
  const area = (property.sizeTotalArea as number) || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Current Value" value={formatCurrency(last.value)} />
        <Stat label="Op-Cost (mo)" value={formatCurrency(last.operatingCost)} />
        <Stat label="Revenue (mo)" value={formatCurrency(last.revenue)} />
        <Stat label="Cost / sq ft" value={formatCurrency(last.operatingCost / area)} />
      </div>

      <ChartCard title="Property Value — 24 mo">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-800" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Op-Cost vs Forecast">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-800" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Area type="monotone" dataKey="forecastCost" fill="#06b6d433" stroke="#06b6d4" name="Forecast" />
            <Area type="monotone" dataKey="operatingCost" fill="#f59e0b33" stroke="#f59e0b" name="Actual" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue vs Cost">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-800" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="operatingCost" fill="#f59e0b" name="Op-Cost" />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-50 tabular-nums">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
      <h4 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}
