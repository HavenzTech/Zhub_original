"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  color?: string;
}

export function GaugeChart({
  value,
  max = 100,
  label,
  unit,
  color = "#3b82f6",
}: GaugeChartProps) {
  const percentage = (value / max) * 100;
  const data = [
    { name: "value", value: percentage, fill: color },
    { name: "empty", value: 100 - percentage, fill: "#e5e7eb" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-gray-900">
          {value.toFixed(1)}
        </div>
        {unit && <div className="text-sm text-gray-600">{unit}</div>}
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}
