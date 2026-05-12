"use client";

import type { Property } from "@/types/bms";
import { fmtDateTime, fmtTime, getSiteTimezone, sitesDiffer, tzAbbr, userTimezone } from "../../utils/siteTime";

interface Props {
  ts: string | number | Date;
  property?: Pick<Property, "id" | "locationProvince">;
  mode?: "time" | "datetime";
  showDiffOnly?: boolean;
  className?: string;
}

export function Timestamp({ ts, property, mode = "time", showDiffOnly = true, className }: Props) {
  const date = ts instanceof Date ? ts : new Date(ts);
  const siteTz = getSiteTimezone(property);
  const userTz = userTimezone();
  const sameTz = siteTz === userTz;
  const fmt = mode === "datetime" ? fmtDateTime : fmtTime;

  if (sameTz || (showDiffOnly && !sitesDiffer(property))) {
    return <span className={`tabular-nums ${className ?? ""}`}>{fmt(date, userTz)}</span>;
  }

  return (
    <span className={`tabular-nums inline-flex items-baseline gap-1 ${className ?? ""}`}>
      <span>{fmt(date, siteTz)}</span>
      <span className="text-[9px] uppercase tracking-wider opacity-60">{tzAbbr(date, siteTz)}</span>
      <span className="opacity-40">·</span>
      <span className="opacity-70">{fmt(date, userTz)}</span>
      <span className="text-[9px] uppercase tracking-wider opacity-50">you</span>
    </span>
  );
}
