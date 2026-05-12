"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Grid, Map as MapIcon, Plus } from "lucide-react";
import { useMyProperties } from "../hooks/useMyProperties";
import { PortfolioKPIStrip } from "./PortfolioKPIStrip";
import { PropertyCardPro } from "./PropertyCardPro";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";

export function PortfolioPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useMyProperties();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"health" | "value" | "alerts">("health");
  const [view, setView] = useState<"grid" | "map">("grid");

  const filtered = useMemo(() => {
    const list = (data?.entries ?? []).filter((e) => {
      if (typeFilter !== "all" && e.property.type !== typeFilter) return false;
      if (query && !e.property.name?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sortBy === "health") return a.health.score - b.health.score;
      if (sortBy === "value") return ((b.property.currentValue as number) || 0) - ((a.property.currentValue as number) || 0);
      return b.criticalAlerts - a.criticalAlerts || b.openAlerts - a.openAlerts;
    });
    return list;
  }, [data, query, typeFilter, sortBy]);

  if (isLoading) return <LoadingSpinnerCentered text="Loading portfolio..." />;
  if (error) return <ErrorDisplayCentered title="Failed to load portfolio" message={(error as Error).message} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">My Properties</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Operational portfolio overview
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> New Property
        </Button>
      </div>

      <PortfolioKPIStrip summary={data.totals} />

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search properties…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="datacenter">Data Center</SelectItem>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="power_plant">Power Plant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="health">Sort: Health (asc)</SelectItem>
            <SelectItem value="value">Sort: Value</SelectItem>
            <SelectItem value="alerts">Sort: Alerts</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-stone-200 dark:border-stone-800 p-0.5">
          <Button size="sm" variant={view === "grid" ? "secondary" : "ghost"} onClick={() => setView("grid")}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button size="sm" variant={view === "map" ? "secondary" : "ghost"} onClick={() => setView("map")}>
            <MapIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <PropertyCardPro
              key={e.property.id as string}
              property={e.property}
              health={e.health}
              openAlerts={e.openAlerts}
              criticalAlerts={e.criticalAlerts}
              openWorkOrders={e.openWorkOrders}
              onClick={() => router.push(`/properties/${e.property.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-stone-500 dark:text-stone-400 p-12 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
              No properties match filters.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-8 text-center text-sm text-stone-500 dark:text-stone-400">
          Map view — coming in a future iteration. Markers will cluster by region and color by health score.
        </div>
      )}
    </div>
  );
}
