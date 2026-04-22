import { cn } from "@/lib/utils";

export function LiveTickDot({ live = true, label }: { live?: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-500 dark:text-stone-400">
      <span className="relative inline-flex h-2 w-2">
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />}
        <span className={cn("relative inline-block h-2 w-2 rounded-full", live ? "bg-emerald-500" : "bg-stone-500")} />
      </span>
      {label ?? (live ? "Live" : "Offline")}
    </span>
  );
}
