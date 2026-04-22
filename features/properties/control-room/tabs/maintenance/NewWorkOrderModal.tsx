"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkOrders } from "../../../hooks/useWorkOrders";
import type { Equipment, WorkOrderPriority } from "../../../types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  propertyId: string;
  equipment: Equipment[];
  defaultEquipmentId?: string;
  defaultInsightId?: string;
  defaultTitle?: string;
}

export function NewWorkOrderModal({ open, onOpenChange, propertyId, equipment, defaultEquipmentId, defaultInsightId, defaultTitle }: Props) {
  const { create } = useWorkOrders(propertyId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [equipmentId, setEquipmentId] = useState<string | undefined>(defaultEquipmentId);
  const [priority, setPriority] = useState<WorkOrderPriority>("medium");

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle ?? "");
      setDescription("");
      setEquipmentId(defaultEquipmentId);
      setPriority("medium");
    }
  }, [open, defaultTitle, defaultEquipmentId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create({
      propertyId,
      equipmentId,
      insightId: defaultInsightId,
      title: title.trim(),
      description: description.trim(),
      priority,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Work Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Inspect engine bearings" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Equipment</Label>
              <Select value={equipmentId ?? "none"} onValueChange={(v) => setEquipmentId(v === "none" ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none —</SelectItem>
                  {equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as WorkOrderPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {defaultInsightId && (
            <div className="text-[11px] rounded-md border border-sky-500/30 bg-sky-500/5 text-sky-600 dark:text-sky-400 px-2 py-1.5">
              Linked to insight {defaultInsightId}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
