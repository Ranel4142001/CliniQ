import { differenceInCalendarDays } from "date-fns";
import { CHAT_CONFIG } from "@backend/contracts";
import { formatDateTime, toManilaTime } from "@/lib/date";
import type {
  ChatParticipant,
  ConsultationMessageDTO,
} from "@backend/contracts";

export interface ChatMessageView extends ConsultationMessageDTO {
  isPending?: boolean;
}

export type ChatItem =
  | { kind: "divider"; key: string; label: string }
  | { kind: "group"; key: string; isMine: boolean; sender: ChatParticipant; messages: ChatMessageView[] };

/** Delivery state of the current user's latest message, shown under it Messenger-style. */
export interface ChatReceipt {
  messageId: string;
  isSeen: boolean;
}

const GROUP_WINDOW_MS = CHAT_CONFIG.GROUP_WINDOW_MINUTES * 60_000;
const TIMESTAMP_GAP_MS = CHAT_CONFIG.TIMESTAMP_GAP_MINUTES * 60_000;
/** Within this many days the timestamp shows the weekday instead of the full date. */
const WEEKDAY_LABEL_MAX_DAYS = 6;

function toTime(value: Date | string): number {
  return new Date(value).getTime();
}

function startsNewGroup(prev: ChatMessageView | undefined, next: ChatMessageView): boolean {
  if (!prev) return true;
  return prev.sender.id !== next.sender.id || toTime(next.createdAt) - toTime(prev.createdAt) > GROUP_WINDOW_MS;
}

function needsTimestamp(prev: ChatMessageView | undefined, next: ChatMessageView): boolean {
  if (!prev) return true;
  const isSameDay = differenceInCalendarDays(toManilaTime(next.createdAt), toManilaTime(prev.createdAt)) === 0;
  return !isSameDay || toTime(next.createdAt) - toTime(prev.createdAt) > TIMESTAMP_GAP_MS;
}

/** Messenger-style centered timestamp: "2:30 PM", "Mon 2:30 PM" or "Oct 3, 2026, 2:30 PM". */
export function formatChatTimestamp(date: Date | string, now: Date | string = new Date()): string {
  const days = differenceInCalendarDays(toManilaTime(now), toManilaTime(date));
  if (days === 0) return formatDateTime(date, "h:mm a");
  if (days > 0 && days <= WEEKDAY_LABEL_MAX_DAYS) return formatDateTime(date, "EEE h:mm a");
  return formatDateTime(date, "MMM d, yyyy, h:mm a");
}

/**
 * Turns a flat, oldest-first message list into centered timestamps (new day or a long
 * pause) and runs of consecutive messages from one sender (Messenger-style grouping).
 */
export function groupMessages(
  messages: ChatMessageView[],
  currentUserId: string,
  now: Date | string = new Date()
): ChatItem[] {
  const items: ChatItem[] = [];
  let prev: ChatMessageView | undefined;

  for (const message of messages) {
    if (needsTimestamp(prev, message)) {
      items.push({ kind: "divider", key: `ts-${message.id}`, label: formatChatTimestamp(message.createdAt, now) });
      prev = undefined;
    }

    const current = items[items.length - 1];
    if (startsNewGroup(prev, message) || current.kind !== "group") {
      items.push({
        kind: "group",
        key: `group-${message.id}`,
        isMine: message.sender.id === currentUserId,
        sender: message.sender,
        messages: [message],
      });
    } else {
      current.messages.push(message);
    }
    prev = message;
  }

  return items;
}

/** Receipt for the current user's latest delivered message: "Sent" until the other participant reads it. */
export function getReceipt(messages: ChatMessageView[], currentUserId: string): ChatReceipt | null {
  const latest = messages.findLast((m) => m.sender.id === currentUserId && !m.isPending);
  return latest ? { messageId: latest.id, isSeen: Boolean(latest.readAt) } : null;
}
