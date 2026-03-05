"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";
import { bmsApi } from "@/lib/services/bmsApi";
import { extractArray } from "@/lib/utils/api";
import type { Department, Project, Property } from "@/types/bms";

interface FlyoutItem {
  id: string;
  name: string;
  href: string;
  subtitle?: string;
}

interface SidebarFlyoutProps {
  itemId: string;
  collapsed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

type FlyoutCache = {
  departments?: FlyoutItem[];
  projects?: FlyoutItem[];
  properties?: FlyoutItem[];
  "workflow-tasks"?: FlyoutItem[];
};

const flyoutCache: FlyoutCache = {};

const FLYOUT_CONFIGS: Record<string, { title: string; viewAllHref: string; viewAllLabel: string }> = {
  departments: { title: "Departments", viewAllHref: "/departments", viewAllLabel: "View all departments" },
  projects: { title: "Projects", viewAllHref: "/projects", viewAllLabel: "View all projects" },
  properties: { title: "Properties", viewAllHref: "/properties", viewAllLabel: "View all properties" },
  "workflow-tasks": { title: "My Tasks", viewAllHref: "/workflow-tasks", viewAllLabel: "View all tasks" },
};

async function fetchFlyoutItems(itemId: string): Promise<FlyoutItem[]> {
  switch (itemId) {
    case "departments": {
      const data = await bmsApi.departments.getAll();
      const departments = extractArray<Department>(data);
      return departments.map((d) => ({
        id: d.id || "",
        name: d.name,
        href: `/departments/${d.id}`,
        subtitle: d.headName || undefined,
      }));
    }
    case "projects": {
      const data = await bmsApi.projects.getAll();
      const projects = extractArray<Project>(data);
      return projects.map((p) => ({
        id: p.id || "",
        name: p.name,
        href: `/projects/${p.id}`,
        subtitle: p.status || undefined,
      }));
    }
    case "properties": {
      const data = await bmsApi.properties.getAll();
      const properties = extractArray<Property>(data);
      return properties.map((p) => ({
        id: p.id || "",
        name: p.name,
        href: `/properties/${p.id}`,
        subtitle: p.type || undefined,
      }));
    }
    case "workflow-tasks": {
      const data = await bmsApi.workflowTasks.getMyTasks();
      const tasks = extractArray<any>(data);
      return tasks.slice(0, 15).map((t: any) => ({
        id: t.id || "",
        name: t.documentTitle || t.title || "Untitled Task",
        href: `/workflow-tasks`,
        subtitle: t.status || t.actionRequired || undefined,
      }));
    }
    default:
      return [];
  }
}

export function SidebarFlyout({
  itemId,
  collapsed,
  onMouseEnter,
  onMouseLeave,
}: SidebarFlyoutProps) {
  const [items, setItems] = useState<FlyoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const config = FLYOUT_CONFIGS[itemId];

  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    const cached = flyoutCache[itemId as keyof FlyoutCache];
    if (cached) {
      setItems(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchFlyoutItems(itemId).then((result) => {
      if (!cancelled) {
        flyoutCache[itemId as keyof FlyoutCache] = result;
        setItems(result);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [itemId, config]);

  if (!config) return null;

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed top-0 bottom-0 z-40 hidden md:flex md:flex-col animate-in slide-in-from-left-2 duration-200 w-60 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-lg"
      style={{ left: sidebarWidth }}
    >
      {/* Header — clickable, navigates to the section */}
      <Link
        href={config.viewAllHref}
        className="flex items-center gap-2 px-4 py-4 border-b border-stone-200 dark:border-stone-800 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
      >
        <h2 className="text-[14px] font-semibold text-stone-900 dark:text-white">
          {config.title}
        </h2>
        <ChevronRight className="ml-auto h-4 w-4 text-stone-400 dark:text-stone-500" />
      </Link>

      {/* Items list — scrollable */}
      <div className="flex-1 overflow-y-auto py-1.5 px-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-3 py-8 text-center text-[13px] text-stone-400">
            No {config.title.toLowerCase()} found
          </div>
        ) : (
          <div className="space-y-0.5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-stone-600 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  {item.subtitle && (
                    <div className="truncate text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                      {item.subtitle}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-3 w-3 shrink-0 text-stone-300 dark:text-stone-600" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* View all button at bottom */}
      <div className="border-t border-stone-200 dark:border-stone-800 p-3">
        <Link
          href={config.viewAllHref}
          className="flex w-full items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-[13px] font-medium text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white"
        >
          {config.viewAllLabel}
        </Link>
      </div>
    </div>
  );
}
