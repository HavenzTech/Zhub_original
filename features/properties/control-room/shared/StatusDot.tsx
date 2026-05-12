import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  nominal: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  offline: "bg-stone-500",
  degraded: "bg-amber-500",
};

export function StatusDot({ status, pulse = false }: { status: string; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {pulse && (
        <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", tone[status] || "bg-stone-500")} />
      )}
      <span className={cn("relative inline-block h-2.5 w-2.5 rounded-full", tone[status] || "bg-stone-500")} />
    </span>
  );
}
