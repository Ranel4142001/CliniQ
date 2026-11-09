import type { ChatCounterpartStatusDTO } from "@backend/contracts";

const MINUTE_MS = 60_000;
const MINUTES_PER_HOUR = 60;
/** Messenger stops showing "Active … ago" after a day. */
const MAX_HOURS_SHOWN = 24;

/** "Active now", "Active 5m ago", "Active 3h ago", or null when unknown or too long ago. */
export function getPresenceLabel(
  status: ChatCounterpartStatusDTO | undefined,
  now: Date = new Date()
): string | null {
  if (!status) return null;
  if (status.isActive) return "Active now";
  if (!status.lastSeenAt) return null;

  const minutes = Math.max(1, Math.floor((now.getTime() - new Date(status.lastSeenAt).getTime()) / MINUTE_MS));
  if (minutes < MINUTES_PER_HOUR) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  return hours < MAX_HOURS_SHOWN ? `Active ${hours}h ago` : null;
}
