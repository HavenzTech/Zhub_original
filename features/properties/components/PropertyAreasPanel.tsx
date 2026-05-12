"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Plus, Loader2, Layers, Monitor, Wifi, WifiOff } from "lucide-react";
import type { PropertyArea, AmicoTerminal } from "@/types/bms";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { toast } from "sonner";

interface PropertyAreasPanelProps {
  propertyId: string;
}

export function PropertyAreasPanel({ propertyId }: PropertyAreasPanelProps) {
  const [areas, setAreas] = useState<PropertyArea[]>([]);
  const [terminals, setTerminals] = useState<AmicoTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add area modal
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [floor, setFloor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();
    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    Promise.all([
      bmsApi.properties.getAreas(propertyId).catch(() => []),
      bmsApi.terminals.getAll().catch(() => []),
    ]).then(([areasRes, terminalsRes]: [any, any]) => {
      const unwrap = (r: any): any[] =>
        Array.isArray(r) ? r : r?.data ?? r?.items ?? r?.areas ?? [];
      setAreas(unwrap(areasRes));
      setTerminals(unwrap(terminalsRes));
    }).finally(() => setLoading(false));
  }, [propertyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Area name is required"); return; }
    setIsSubmitting(true);
    try {
      const created = await bmsApi.properties.createArea(propertyId, {
        name: name.trim(),
        description: description.trim() || undefined,
        floor: floor.trim() || undefined,
      });
      setAreas((prev) => [...prev, created]);
      toast.success(`Area "${name.trim()}" created`);
      setShowAdd(false);
      setName("");
      setDescription("");
      setFloor("");
    } catch {
      toast.error("Failed to create area");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
            <MapPin className="w-5 h-5" />
            Access Areas
          </h3>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-1.5" />Add Area
            </Button>
          )}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-stone-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />Loading areas...
            </div>
          ) : areas.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm text-stone-400 dark:text-stone-500">No areas defined yet</p>
              {isAdmin && (
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Areas represent physical zones (e.g. Server Room, Reception). Users and HID terminals are assigned to areas.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {areas.map((area) => {
                const areaTerminals = terminals.filter((t) => t.area?.id === area.id);
                return (
                  <div key={area.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-50">{area.name}</p>
                        <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
                          {area.floor && <span>Floor {area.floor}</span>}
                          {area.description && <span>{area.description}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-stone-300 dark:text-stone-600 font-mono">{area.id?.slice(0, 8)}…</span>
                    </div>
                    {areaTerminals.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {areaTerminals.map((t) => {
                          const online = t.status === "Active";
                          return (
                            <div key={t.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                              <Monitor className="w-3 h-3 text-stone-400" />
                              <span className="text-stone-700 dark:text-stone-300">{t.name}</span>
                              {online
                                ? <Wifi className="w-3 h-3 text-green-500" />
                                : <WifiOff className="w-3 h-3 text-stone-400" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Area Modal */}
      <Dialog open={showAdd} onOpenChange={(v) => { if (!isSubmitting) { setShowAdd(v); if (!v) { setName(""); setDescription(""); setFloor(""); } } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Area</DialogTitle>
            <DialogDescription>
              Define a physical zone within this property. Users and HID terminals are assigned to areas to control who can access which doors.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area-name">Name *</Label>
              <Input id="area-name" placeholder="e.g. Server Room, Reception, Parking Level 1"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area-floor">Floor</Label>
              <Input id="area-floor" placeholder="e.g. 2, B1, Ground" value={floor}
                onChange={(e) => setFloor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area-description">Description (optional)</Label>
              <Textarea id="area-description" placeholder="Any notes about this area..."
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2} className="resize-none" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Plus className="w-4 h-4 mr-2" />Create Area</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
