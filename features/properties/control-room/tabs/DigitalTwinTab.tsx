"use client";

import { Box } from "lucide-react";

export function DigitalTwinTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-center">
      <Box className="w-10 h-10 text-stone-300 dark:text-stone-600" />
      <div>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">3D Digital Twin</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-xs">
          The interactive 3D viewer will appear here once a model has been uploaded for this property.
        </p>
      </div>
    </div>
  );
}
