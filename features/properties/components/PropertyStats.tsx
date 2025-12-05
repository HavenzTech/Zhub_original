"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/types/bms";
import { Home, Building2, DollarSign, Square } from "lucide-react";
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={<Home className="w-5 h-5 text-blue-600" />}
        iconBg="bg-blue-100"
        value={properties.length.toString()}
        label="Total Properties"
      />
      <StatCard
        icon={<Building2 className="w-5 h-5 text-green-600" />}
        iconBg="bg-green-100"
        value={activeCount.toString()}
        label="Active"
      />
      <StatCard
        icon={<DollarSign className="w-5 h-5 text-purple-600" />}
        iconBg="bg-purple-100"
        value={formatCurrency(totalValue)}
        label="Total Value"
      />
      <StatCard
        icon={<Square className="w-5 h-5 text-orange-600" />}
        iconBg="bg-orange-100"
        value={totalArea.toLocaleString()}
        label="Total Sq Ft"
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
