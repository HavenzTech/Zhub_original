import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

function gradeColor(score: number): string {
  if (score >= 85) return "stroke-emerald-500";
  if (score >= 70) return "stroke-amber-500";
  return "stroke-red-500";
}

function gradeText(score: number): string {
  if (score >= 85) return "text-emerald-500";
  if (score >= 70) return "text-amber-500";
  return "text-red-500";
}

export function HealthGauge({ score, size = "md", label }: HealthGaugeProps) {
  const radius = size === "sm" ? 18 : size === "lg" ? 36 : 26;
  const stroke = size === "sm" ? 3 : size === "lg" ? 6 : 4;
  const box = (radius + stroke) * 2;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - Math.max(0, Math.min(1, score / 100)));
  return (
    <div className="flex items-center gap-2">
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-stone-200 dark:stroke-stone-800"
          fill="none"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          strokeWidth={stroke}
          className={cn(gradeColor(score), "transition-all duration-500")}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div>
        <div className={cn("font-bold tabular-nums", gradeText(score), size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base")}>
          {score}
        </div>
        {label && (
          <div className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</div>
        )}
      </div>
    </div>
  );
}
