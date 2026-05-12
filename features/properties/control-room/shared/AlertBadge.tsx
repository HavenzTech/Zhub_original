import { AlertTriangle } from "lucide-react";

interface AlertBadgeProps {
  open: number;
  critical?: number;
}

export function AlertBadge({ open, critical = 0 }: AlertBadgeProps) {
  const tone =
    critical > 0 ? "bg-red-500/10 text-red-500 border-red-500/30"
    : open > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
    : "bg-stone-500/10 text-stone-500 border-stone-500/30";
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${tone}`}>
      <AlertTriangle className="w-3.5 h-3.5" />
      <span className="tabular-nums">{open}</span>
      <span className="text-[10px] uppercase tracking-wide opacity-70">open</span>
      {critical > 0 && (
        <>
          <span className="h-3 w-px bg-current opacity-30" />
          <span className="tabular-nums">{critical}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-70">crit</span>
        </>
      )}
    </div>
  );
}
