"use client";

import type { Property } from "@/types/bms";
import type { PropertyHealthScore } from "../types";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { HealthGauge } from "../control-room/shared/HealthGauge";
import { AlertBadge } from "../control-room/shared/AlertBadge";
import { formatCurrency, getStatusColor, getTypeIcon } from "../utils/propertyHelpers";
import { Badge } from "@/components/ui/badge";

interface Props {
  property: Property;
  health: PropertyHealthScore;
  openAlerts: number;
  criticalAlerts: number;
  openWorkOrders: number;
  onClick: () => void;
}

export function PropertyCardPro({ property, health, openAlerts, criticalAlerts, openWorkOrders, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg hover:border-accent-cyan/40 transition-all group overflow-hidden"
    >
      <div className="relative h-32 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition">
          <div className="w-24 h-24 rounded-xl bg-accent-cyan/20 flex items-center justify-center scale-150">
            {getTypeIcon(property.type)}
          </div>
        </div>
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge className={getStatusColor(property.status)} variant="secondary">{property.status}</Badge>
          <AlertBadge open={openAlerts} critical={criticalAlerts} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate drop-shadow">{property.name}</h3>
            {(property.locationCity || property.locationProvince) && (
              <div className="flex items-center gap-1 text-white/70 text-[10px]">
                <MapPin className="w-3 h-3" />
                {[property.locationCity, property.locationProvince].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
          <HealthGauge score={health.score} size="sm" />
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 gap-2 text-xs">
        <Cell label="Value" value={formatCurrency(property.currentValue)} />
        <Cell label="Op-Cost" value={formatCurrency(property.monthlyOperatingCosts)} />
        <Cell label="Open WOs" value={String(openWorkOrders)} />
      </div>
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</div>
      <div className="font-semibold text-stone-900 dark:text-stone-50 tabular-nums">{value}</div>
    </div>
  );
}
