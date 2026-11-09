import { CHAT_CONFIG } from "@backend/modules/consultations/domain/constants/consultation.constants";

export interface ChatPresence {
  lastSeenAt: Date;
  typingAt: Date | null;
}

export interface CounterpartStatus {
  lastSeenAt: Date | null;
  isActive: boolean;
  isTyping: boolean;
}

function isWithin(at: Date, now: Date, seconds: number): boolean {
  return now.getTime() - at.getTime() <= seconds * 1000;
}

/**
 * Messenger-style status of the other participant. Typing ends early once they send
 * a message after their last keystroke ping, so the dots never outlive the bubble.
 */
export function getCounterpartStatus(
  presence: ChatPresence | null,
  lastMessageAt: Date | null,
  now: Date
): CounterpartStatus {
  if (!presence) return { lastSeenAt: null, isActive: false, isTyping: false };
  const { typingAt } = presence;
  const isTyping =
    typingAt !== null &&
    isWithin(typingAt, now, CHAT_CONFIG.TYPING_WINDOW_SECONDS) &&
    (lastMessageAt === null || typingAt > lastMessageAt);
  return {
    lastSeenAt: presence.lastSeenAt,
    isActive: isWithin(presence.lastSeenAt, now, CHAT_CONFIG.ACTIVE_WINDOW_SECONDS),
    isTyping,
  };
}
