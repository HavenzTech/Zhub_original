interface SparklineCellProps {
  values: number[];
  width?: number;
  height?: number;
  tone?: "ok" | "warn" | "crit";
  warnMin?: number;
  warnMax?: number;
  critMin?: number;
  critMax?: number;
}

const strokes = {
  ok: "stroke-emerald-500",
  warn: "stroke-amber-500",
  crit: "stroke-red-500",
};

export function SparklineCell({
  values,
  width = 80,
  height = 24,
  tone = "ok",
  warnMin,
  warnMax,
  critMin,
  critMax,
}: SparklineCellProps) {
  if (values.length < 2) {
    return <div className="h-[24px] text-[10px] text-stone-400">—</div>;
  }
  const vMin = Math.min(...values);
  const vMax = Math.max(...values);
  const lo = Math.min(vMin, warnMin ?? vMin, critMin ?? vMin);
  const hi = Math.max(vMax, warnMax ?? vMax, critMax ?? vMax);
  const span = hi - lo || 1;
  const y = (v: number) => height - ((v - lo) / span) * height;
  const step = width / (values.length - 1);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");

  const bandTop = warnMax !== undefined ? y(warnMax) : 0;
  const bandBottom = warnMin !== undefined ? y(warnMin) : height;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {(warnMin !== undefined || warnMax !== undefined) && (
        <rect
          x={0}
          y={bandTop}
          width={width}
          height={Math.max(0, bandBottom - bandTop)}
          className="fill-emerald-500/10"
        />
      )}
      <path d={d} className={`${strokes[tone]} fill-none`} strokeWidth={1.5} />
    </svg>
  );
}
