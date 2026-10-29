import { CHAT_CONFIG } from "@backend/contracts";
import { formatDate } from "@/lib/date";
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

const GROUP_WINDOW_MS = CHAT_CONFIG.GROUP_WINDOW_MINUTES * 60_000;

function toTime(value: Date | string): number {
  return new Date(value).getTime();
}

function startsNewGroup(prev: ChatMessageView | undefined, next: ChatMessageView): boolean {
  if (!prev) return true;
  return prev.sender.id !== next.sender.id || toTime(next.createdAt) - toTime(prev.createdAt) > GROUP_WINDOW_MS;
}

/**
 * Turns a flat, oldest-first message list into date dividers and runs of
 * consecutive messages from one sender (Messenger-style bubble grouping).
 */
export function groupMessages(messages: ChatMessageView[], currentUserId: string): ChatItem[] {
  const items: ChatItem[] = [];
  let lastDay = "";
  let prev: ChatMessageView | undefined;

  for (const message of messages) {
    const day = formatDate(message.createdAt, "EEEE, MMM d, yyyy");
    if (day !== lastDay) {
      items.push({ kind: "divider", key: `day-${day}`, label: day });
      lastDay = day;
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

/** Id of the current user's latest message, if the other participant has read it. */
export function getSeenMessageId(messages: ChatMessageView[], currentUserId: string): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.sender.id === currentUserId) {
      return message.readAt ? message.id : null;
    }
  }
  return null;
}
