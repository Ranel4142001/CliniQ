import { differenceInCalendarDays } from "date-fns";
import { formatDateTime, toManilaTime } from "@/lib/date";
import type { ChatConversationDTO } from "@backend/contracts";

/** Within this many days the inbox shows the weekday instead of a date. */
const WEEKDAY_LABEL_MAX_DAYS = 6;

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
export function getConversationPreview(conversation: ChatConversationDTO): string {
  const { lastMessage } = conversation;
  if (!lastMessage) return conversation.canSend ? "Say hello 👋" : "No messages";
  const body = lastMessage.body.replace(/\s+/g, " ");
  return lastMessage.isMine ? `You: ${body}` : body;
}

export function filterConversations(
  conversations: ChatConversationDTO[],
  query: string
): ChatConversationDTO[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return conversations;
  return conversations.filter((c) => c.counterpartName.toLowerCase().includes(needle));
}

export function getTotalUnread(conversations: ChatConversationDTO[]): number {
  return conversations.reduce((total, c) => total + c.unreadCount, 0);
}
