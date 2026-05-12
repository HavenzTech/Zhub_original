import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  warn: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  info: "bg-sky-500/10 text-sky-500 border-sky-500/30",
};

export function SeverityPill({ severity }: { severity: "info" | "warn" | "critical" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", styles[severity])}>
      {severity}
    </span>
  );
}
