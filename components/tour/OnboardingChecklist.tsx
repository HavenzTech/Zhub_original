"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useTourContext } from "@/contexts/TourContext";
import { authService } from "@/lib/services/auth";
import type { TourKey } from "@/lib/tour/types";

interface ChecklistItem {
  key: TourKey;
  label: string;
  route: string;
  adminOnly?: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: "dashboard", label: "Explore the Dashboard", route: "/" },
  { key: "projects_list", label: "Browse Projects", route: "/projects" },
  { key: "project_detail", label: "View a Project's Details", route: "/projects" },
  { key: "departments_list", label: "Check out Departments", route: "/departments" },
  { key: "department_detail", label: "View a Department's Details", route: "/departments" },
  { key: "properties_list", label: "Explore Properties", route: "/properties" },
  { key: "property_detail", label: "View a Property's Details", route: "/properties" },
  { key: "document_control", label: "Discover Document Control", route: "/document-control" },
  { key: "workflow_tasks", label: "Review Your Tasks", route: "/workflow-tasks" },
  { key: "settings", label: "Visit Settings", route: "/settings" },
  { key: "z_ai", label: "Try Z AI Assistant", route: "/z-ai" },
];

export function OnboardingChecklist() {
  const router = useRouter();
  const { isCompleted, isLoaded } = useTourContext();
  const [collapsed, setCollapsed] = useState(false);

  if (!isLoaded) return null;

  const isAdmin = authService.isAdmin();

  // Filter out admin-only items for non-admin users
  const visibleItems = CHECKLIST_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const completedCount = visibleItems.filter((item) =>
    isCompleted(item.key)
  ).length;
  const totalCount = visibleItems.length;
  const allDone = completedCount === totalCount;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Don't show if all tours are completed
  if (allDone) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/10">
          <Sparkles className="h-4 w-4 text-accent-cyan" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            Getting Started
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400">
            {completedCount} of {totalCount} tours completed
          </div>
        </div>
        {/* Progress ring */}
        <div className="relative h-9 w-9 shrink-0">
          <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-stone-200 dark:text-stone-700"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
              strokeLinecap="round"
              className="text-accent-cyan transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-stone-600 dark:text-stone-300">
            {Math.round(progressPercent)}%
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-stone-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-stone-400" />
        )}
      </button>

      {/* Progress bar */}
      {!collapsed && (
        <div className="px-5">
          <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist items */}
      {!collapsed && (
        <div className="px-3 py-3 space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-modern">
          {visibleItems.map((item) => {
            const done = isCompleted(item.key);
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (!done) {
                    router.push(item.route);
                  }
                }}
                disabled={done}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  done
                    ? "opacity-60 cursor-default"
                    : "hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-accent-cyan shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-stone-300 dark:text-stone-600 shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    done
                      ? "text-stone-400 dark:text-stone-500 line-through"
                      : "text-stone-700 dark:text-stone-200"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
