import { differenceInCalendarDays } from "date-fns";
import { formatDateTime, toManilaTime } from "@/lib/date";
import { ROUTES } from "@/constants/routes";
import type { AppointmentStatus } from "@prisma/client";
import type { ChatConversationDTO, FrontDeskThreadDTO } from "@backend/contracts";

/** Within this many days the inbox shows the weekday instead of a date. */
const WEEKDAY_LABEL_MAX_DAYS = 6;

/** Shown after the visit date when a consultation chat is no longer (or not yet) open. */
const STATUS_NOTES: Partial<Record<AppointmentStatus, string>> = {
  PENDING: "Awaiting confirmation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Missed",
};

type LastMessage = { body: string; createdAt: Date | string; isMine: boolean } | null;

/** One row of the Messages list, whichever kind of chat it is. */
export interface InboxItem {
  key: string;
  href: string;
  title: string;
  preview: string;
  meta: string;
  lastMessageAt: Date | string | null;
  unreadCount: number;
  /** Clinic front desk thread (pinned on top for patients). */
  isFrontDesk: boolean;
  /** "clinic": building icon (the patient's view of the front desk); "person": initials. */
  avatar: "clinic" | "person";
}

/** Messenger-style inbox time: "2:30 PM", "Mon", "Oct 3" or "Oct 3, 2025". */
export function formatInboxTimestamp(date: Date | string, now: Date | string = new Date()): string {
  const zoned = toManilaTime(date);
  const zonedNow = toManilaTime(now);
  const days = differenceInCalendarDays(zonedNow, zoned);
  if (days === 0) return formatDateTime(date, "h:mm a");
  if (days > 0 && days <= WEEKDAY_LABEL_MAX_DAYS) return formatDateTime(date, "EEE");
  if (zoned.getFullYear() === zonedNow.getFullYear()) return formatDateTime(date, "MMM d");
  return formatDateTime(date, "MMM d, yyyy");
}

/** One-line preview of the latest message, e.g. "You: See you at 3". */
export function getPreview(lastMessage: LastMessage, mineLabel: string, emptyText: string): string {
  if (!lastMessage) return emptyText;
  const body = lastMessage.body.replace(/\s+/g, " ");
  return lastMessage.isMine ? `${mineLabel}: ${body}` : body;
}

export function fromConsultation(c: ChatConversationDTO): InboxItem {
  const statusNote = STATUS_NOTES[c.status];
  return {
    key: `consultation-${c.appointmentId}`,
    href: ROUTES.MESSAGE_THREAD(c.appointmentId),
    title: c.counterpartName,
    preview: getPreview(c.lastMessage, "You", c.canSend ? "Say hello 👋" : "No messages"),
    meta: `Visit ${formatDateTime(c.scheduledAt, "MMM d, h:mm a")}${statusNote ? ` · ${statusNote}` : ""}`,
    lastMessageAt: c.lastMessage?.createdAt ?? null,
    unreadCount: c.unreadCount,
    isFrontDesk: false,
    avatar: "person",
  };
}

/** Patients see "Clinic front desk"; admins and staff see the patient (and "Clinic:" for any staff reply). */
export function fromFrontDeskThread(t: FrontDeskThreadDTO, viewerIsPatient: boolean): InboxItem {
  return {
    key: `desk-${t.patientId}`,
    href: ROUTES.FRONT_DESK_THREAD(t.patientId),
    title: viewerIsPatient ? "Clinic front desk" : t.patientName,
    preview: viewerIsPatient
      ? getPreview(t.lastMessage, "You", "Questions about bookings, payments or pickups")
      : getPreview(t.lastMessage, "Clinic", "No messages yet"),
    meta: viewerIsPatient ? "Clinic staff" : t.patientNo,
    lastMessageAt: t.lastMessage?.createdAt ?? null,
    unreadCount: t.unreadCount,
    isFrontDesk: true,
    avatar: viewerIsPatient ? "clinic" : "person",
  };
}

function toTime(value: Date | string | null): number | null {
  return value === null ? null : new Date(value).getTime();
}

/**
 * Newest message first, like Messenger; chats with no messages keep their given order after them.
 * A patient's front-desk thread is pinned on top so it is always easy to find.
 */
export function sortInbox(items: InboxItem[], pinFrontDesk: boolean): InboxItem[] {
  return [...items].sort((a, b) => {
    if (pinFrontDesk && a.isFrontDesk !== b.isFrontDesk) return a.isFrontDesk ? -1 : 1;
    const aAt = toTime(a.lastMessageAt);
    const bAt = toTime(b.lastMessageAt);
    if (aAt !== null && bAt !== null) return bAt - aAt;
    if (aAt !== null || bAt !== null) return aAt !== null ? -1 : 1;
    return 0;
  });
}

export function filterInbox(items: InboxItem[], query: string): InboxItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => `${item.title} ${item.meta}`.toLowerCase().includes(needle));
}

export function getTotalUnread(items: { unreadCount: number }[]): number {
  return items.reduce((total, item) => total + item.unreadCount, 0);
}
