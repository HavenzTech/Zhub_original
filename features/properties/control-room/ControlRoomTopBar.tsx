"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Plus, UserPlus } from "lucide-react";

interface Props {
  onBack: () => void;
  onEdit: () => void;
  onNewWorkOrder: () => void;
  onAssignStaff: () => void;
}

export function ControlRoomTopBar({ onBack, onEdit, onNewWorkOrder, onAssignStaff }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 pb-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-stone-600 dark:text-stone-400">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Portfolio
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAssignStaff}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Assign Staff
        </Button>
        <Button variant="outline" size="sm" onClick={onNewWorkOrder}>
          <Plus className="w-4 h-4 mr-1.5" />
          Work Order
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1.5" />
          Edit
        </Button>
      </div>
    </div>
  );
}
