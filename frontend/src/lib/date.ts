import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const CLINIC_TIMEZONE = "Asia/Manila";

export function toManilaTime(date: Date | string): Date {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(parsed, CLINIC_TIMEZONE);
}

export function formatDate(date: Date | string | null | undefined, pattern = "MMM dd, yyyy"): string {
  if (!date) return "-";
  try {
    const zoned = toManilaTime(date);
    return format(zoned, pattern);
  } catch {
    return "-";
  }
}

export function formatDateTime(
  date: Date | string | null | undefined,
  pattern = "MMM dd, yyyy h:mm a"
): string {
  if (!date) return "-";
  try {
    const zoned = toManilaTime(date);
    return format(zoned, pattern);
  } catch {
    return "-";
  }
}

export function formatTime(date: Date | string | null | undefined): string {
  return formatDateTime(date, "h:mm a");
}

export function getTodayManila(): Date {
  return toManilaTime(new Date());
}
