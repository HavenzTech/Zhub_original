"use client";

import { useState } from "react";
import { Monitor, ShieldOff } from "lucide-react";
import { TerminalManagementPanel } from "./TerminalManagementPanel";
import { EmergencyControlsPanel } from "./EmergencyControlsPanel";

type SubTab = "terminals" | "emergency";

const subTabs: { id: SubTab; label: string; icon: typeof Monitor }[] = [
  { id: "terminals", label: "Terminals", icon: Monitor },
  { id: "emergency", label: "Emergency Controls", icon: ShieldOff },
];

export function AccessControlTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("terminals");

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg w-fit">
        {subTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSubTab === id
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            } ${id === "emergency" && activeSubTab !== "emergency" ? "hover:text-red-600 dark:hover:text-red-400" : ""}`}
          >
            <Icon className={`w-4 h-4 ${id === "emergency" ? (activeSubTab === "emergency" ? "text-red-600 dark:text-red-400" : "") : ""}`} />
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === "terminals" && <TerminalManagementPanel />}
      {activeSubTab === "emergency" && <EmergencyControlsPanel />}
    </div>
  );
}
