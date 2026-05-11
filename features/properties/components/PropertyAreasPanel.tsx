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
import { MapPin, Plus, Loader2, Layers } from "lucide-react";
import type { PropertyArea } from "@/types/bms";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { toast } from "sonner";

interface PropertyAreasPanelProps {
  propertyId: string;
}

export function PropertyAreasPanel({ propertyId }: PropertyAreasPanelProps) {
  const [areas, setAreas] = useState<PropertyArea[]>([]);
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
    bmsApi.properties.getAreas(propertyId)
      .then((res: any) => {
        console.log('[PropertyAreasPanel] getAreas response:', res);
        if (Array.isArray(res)) return setAreas(res);
        if (res?.data && Array.isArray(res.data)) return setAreas(res.data);
        if (res?.items && Array.isArray(res.items)) return setAreas(res.items);
        if (res?.areas && Array.isArray(res.areas)) return setAreas(res.areas);
        setAreas([]);
      })
      .catch((err) => { console.error('[PropertyAreasPanel] getAreas error:', err); setAreas([]); })
      .finally(() => setLoading(false));
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
              {areas.map((area) => (
                <div key={area.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-50">{area.name}</p>
                    <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
                      {area.floor && <span>Floor {area.floor}</span>}
                      {area.description && <span>{area.description}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-stone-300 dark:text-stone-600 font-mono">{area.id?.slice(0, 8)}…</span>
                </div>
              ))}
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
