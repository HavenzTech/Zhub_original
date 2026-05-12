import type { Property } from "@/types/bms";

const PROPERTY_TIMEZONES: Record<string, string> = {
  "prop-brahms-hpp": "America/Edmonton",
  "prop-meridian-tower": "America/Toronto",
  "prop-northfield-dc": "America/Toronto",
  "prop-glacier-cold": "America/Edmonton",
  "prop-harbor-mixed": "America/Vancouver",
  "prop-cascade-logistics": "America/Winnipeg",
};

const PROVINCE_FALLBACK: Record<string, string> = {
  AB: "America/Edmonton",
  BC: "America/Vancouver",
  SK: "America/Regina",
  MB: "America/Winnipeg",
  ON: "America/Toronto",
  QC: "America/Toronto",
  NB: "America/Moncton",
  NS: "America/Halifax",
  NL: "America/St_Johns",
  PE: "America/Halifax",
  YT: "America/Whitehorse",
  NT: "America/Yellowknife",
  NU: "America/Iqaluit",
};

export function getSiteTimezone(property: Pick<Property, "id" | "locationProvince"> | null | undefined): string {
  if (!property) return userTimezone();
  const override = PROPERTY_TIMEZONES[property.id as string];
  if (override) return override;
  const prov = property.locationProvince as string | undefined;
  if (prov && PROVINCE_FALLBACK[prov]) return PROVINCE_FALLBACK[prov];
  return userTimezone();
}

export function userTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function tzAbbr(date: Date, tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

export function fmtTime(date: Date, tz: string, opts: Intl.DateTimeFormatOptions = {}): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz,
      ...opts,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function fmtDateTime(date: Date, tz: string): string {
  return fmtTime(date, tz, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function sitesDiffer(property: Pick<Property, "id" | "locationProvince"> | null | undefined): boolean {
  if (!property) return false;
  return getSiteTimezone(property) !== userTimezone();
}
