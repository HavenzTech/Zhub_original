"use client";

import { Property } from "@/types/bms";
import { formatCurrency } from "../utils/propertyHelpers";

interface PropertyStatsProps {
  properties: Property[];
}

export function PropertyStats({ properties }: PropertyStatsProps) {
  const totalValue = properties.reduce(
    (sum, p) => sum + (p.currentValue || 0),
    0
  );

  const activeCount = properties.filter((p) => p.status === "active").length;

  const totalArea = properties.reduce(
    (sum, p) => sum + (p.sizeTotalArea || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Properties", value: properties.length.toString() },
        { label: "Active", value: activeCount.toString() },
        { label: "Total Value", value: formatCurrency(totalValue) },
        { label: "Total Sq Ft", value: totalArea.toLocaleString() },
      ].map((stat) => (
        <div
          key={stat.label}
          className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700"
        >
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">{stat.label}</div>
          <div className="text-3xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
