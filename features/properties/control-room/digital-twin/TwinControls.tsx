"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import type { PropertyZone } from "../../types";

interface Props {
  onReset: () => void;
  showSensors: boolean;
  setShowSensors: (v: boolean) => void;
  showEquipment: boolean;
  setShowEquipment: (v: boolean) => void;
  zones: PropertyZone[];
  isolateZoneId: string | null;
  setIsolateZoneId: (v: string | null) => void;
  fullscreen: boolean;
  setFullscreen: (v: boolean) => void;
  usingGlb: boolean;
}

export function TwinControls(props: Props) {
  return (
    <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-950/80 backdrop-blur px-2 py-1.5">
        <label className="flex items-center gap-1.5 text-stone-300">
          <Switch checked={props.showSensors} onCheckedChange={props.setShowSensors} />
          Sensors
        </label>
        <label className="flex items-center gap-1.5 text-stone-300">
          <Switch checked={props.showEquipment} onCheckedChange={props.setShowEquipment} />
          Equipment
        </label>
      </div>
      <Select value={props.isolateZoneId ?? "all"} onValueChange={(v) => props.setIsolateZoneId(v === "all" ? null : v)}>
        <SelectTrigger className="w-44 h-8 bg-stone-950/80 text-stone-300 border-stone-700 text-xs">
          <SelectValue placeholder="Isolate zone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All zones</SelectItem>
          {props.zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="ml-auto flex items-center gap-2">
        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${props.usingGlb ? "border-accent-cyan text-accent-cyan" : "border-stone-600 text-stone-400"}`}>
          {props.usingGlb ? "glTF model" : "Procedural"}
        </span>
        <Button size="icon" variant="ghost" onClick={props.onReset} className="h-7 w-7 text-stone-300 hover:text-stone-50" title="Reset view">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => props.setFullscreen(!props.fullscreen)} className="h-7 w-7 text-stone-300 hover:text-stone-50" title="Fullscreen">
          {props.fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}
