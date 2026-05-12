"use client";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: "default" | "info";
}

export function EmptyState({ icon, title, description, actionLabel, onAction, secondaryLabel, onSecondary, tone = "default" }: EmptyStateProps) {
  return (
    <div className={`rounded-xl border border-dashed p-8 text-center ${tone === "info" ? "border-accent-cyan/30 bg-accent-cyan/5" : "border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30"}`}>
      {icon && (
        <div className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center bg-stone-200/60 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">{description}</p>
      )}
      {(actionLabel || secondaryLabel) && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button size="sm" variant="outline" onClick={onSecondary}>{secondaryLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
