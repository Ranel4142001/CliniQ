import { describe, it, expect } from "vitest";
import type { ChatConversationDTO } from "@backend/contracts";
import {
  filterConversations,
  formatInboxTimestamp,
  getConversationPreview,
  getTotalUnread,
} from "@/features/consultations/utils/inbox";
import { canUseChat } from "@/features/consultations/utils/chat-roles";
import { formatBadgeCount } from "@/lib/format";

function conversation(overrides: Partial<ChatConversationDTO> = {}): ChatConversationDTO {
  return {
    appointmentId: "appt-1",
    counterpartName: "Dr. Alberto Cruz, MD",
    scheduledAt: "2026-10-29T02:00:00Z",
    status: "CONFIRMED",
    canSend: true,
    lastMessage: null,
    unreadCount: 0,
    ...overrides,
  };
}

describe("formatInboxTimestamp", () => {
  const NOW = "2026-10-29T06:00:00Z"; // Thu 2:00 PM Manila

  it("shortens like Messenger: time today, weekday this week, then the date", () => {
    expect(formatInboxTimestamp("2026-10-29T02:00:00Z", NOW)).toBe("10:00 AM");
    expect(formatInboxTimestamp("2026-10-26T02:00:00Z", NOW)).toBe("Mon");
    expect(formatInboxTimestamp("2026-09-03T02:00:00Z", NOW)).toBe("Sep 3");
    expect(formatInboxTimestamp("2025-09-03T02:00:00Z", NOW)).toBe("Sep 3, 2025");
  });
});

describe("getConversationPreview", () => {
  it("prefixes my own messages and flattens line breaks", () => {
    const mine = conversation({
      lastMessage: { body: "See you\nat 3", createdAt: "2026-10-29T02:00:00Z", isMine: true },
    });
    expect(getConversationPreview(mine)).toBe("You: See you at 3");
  });

  it("invites a first message only while the chat is open", () => {
    expect(getConversationPreview(conversation())).toBe("Say hello 👋");
    expect(getConversationPreview(conversation({ canSend: false }))).toBe("No messages");
  });
});

describe("inbox helpers", () => {
  it("filters by name, ignoring case and blanks", () => {
    const list = [conversation(), conversation({ appointmentId: "b", counterpartName: "Juan Dela Cruz" })];
    expect(filterConversations(list, "  ").length).toBe(2);
    expect(filterConversations(list, "juan").map((c) => c.appointmentId)).toEqual(["b"]);
  });

  it("sums unread counts and caps the badge text", () => {
    expect(getTotalUnread([conversation({ unreadCount: 2 }), conversation({ unreadCount: 3 })])).toBe(5);
    expect(formatBadgeCount(7)).toBe("7");
    expect(formatBadgeCount(150)).toBe("99+");
  });

  it("gives an inbox only to patients and clinicians", () => {
    expect(canUseChat("PATIENT")).toBe(true);
    expect(canUseChat("CLINICIAN")).toBe(true);
    expect(canUseChat("ADMIN")).toBe(false);
    expect(canUseChat("STAFF")).toBe(false);
  });
});
