import { describe, it, expect } from "vitest";
import {
  formatChatTimestamp,
  getReceipt,
  groupMessages,
  type ChatMessageView,
} from "@/features/consultations/utils/group-messages";
import { getPresenceLabel } from "@/features/consultations/utils/presence-label";
import { sendMessageSchema } from "@backend/contracts";

const ME = { id: "me", fullName: "Dr. Cruz", role: "CLINICIAN" as const };
const THEM = { id: "them", fullName: "Juan Dela Cruz", role: "PATIENT" as const };

function msg(id: string, sender: typeof ME | typeof THEM, iso: string, readAt: string | null = null): ChatMessageView {
  return { id, body: id, createdAt: iso, readAt, sender };
}

describe("groupMessages", () => {
  it("groups consecutive messages from one sender within the time window", () => {
    const items = groupMessages(
      [
        msg("a", THEM, "2026-10-29T02:00:00Z"),
        msg("b", THEM, "2026-10-29T02:01:00Z"),
        msg("c", ME, "2026-10-29T02:02:00Z"),
      ],
      ME.id
    );
    const groups = items.filter((i) => i.kind === "group");
    expect(groups).toHaveLength(2);
    expect(groups[0].kind === "group" && groups[0].messages.map((m) => m.id)).toEqual(["a", "b"]);
    expect(groups[1].kind === "group" && groups[1].isMine).toBe(true);
  });

  it("starts a new group after a long pause from the same sender", () => {
    const items = groupMessages(
      [msg("a", THEM, "2026-10-29T02:00:00Z"), msg("b", THEM, "2026-10-29T02:30:00Z")],
      ME.id
    );
    expect(items.filter((i) => i.kind === "group")).toHaveLength(2);
  });

  it("inserts a date divider for each new day (clinic timezone)", () => {
    const items = groupMessages(
      [msg("a", THEM, "2026-10-28T02:00:00Z"), msg("b", THEM, "2026-10-29T02:00:00Z")],
      ME.id
    );
    expect(items.map((i) => i.kind)).toEqual(["divider", "group", "divider", "group"]);
  });

  it("adds a centered timestamp after a long pause on the same day", () => {
    const items = groupMessages(
      [msg("a", THEM, "2026-10-29T02:00:00Z"), msg("b", ME, "2026-10-29T02:05:00Z"), msg("c", THEM, "2026-10-29T03:00:00Z")],
      ME.id
    );
    expect(items.map((i) => i.kind)).toEqual(["divider", "group", "group", "divider", "group"]);
  });
});

describe("formatChatTimestamp", () => {
  const NOW = "2026-10-29T06:00:00Z"; // Thu 2:00 PM Manila

  it("shows only the time today, the weekday this week, and the full date before that", () => {
    expect(formatChatTimestamp("2026-10-29T02:00:00Z", NOW)).toBe("10:00 AM");
    expect(formatChatTimestamp("2026-10-26T02:00:00Z", NOW)).toBe("Mon 10:00 AM");
    expect(formatChatTimestamp("2026-10-01T02:00:00Z", NOW)).toBe("Oct 1, 2026, 10:00 AM");
  });
});

describe("getReceipt", () => {
  it("marks my latest message as sent until it is read, then seen", () => {
    const unread = [msg("a", ME, "2026-10-29T02:00:00Z", "2026-10-29T02:01:00Z"), msg("b", ME, "2026-10-29T02:02:00Z")];
    expect(getReceipt(unread, ME.id)).toEqual({ messageId: "b", isSeen: false });

    const read = [msg("a", ME, "2026-10-29T02:00:00Z", "2026-10-29T02:01:00Z"), msg("b", THEM, "2026-10-29T02:02:00Z")];
    expect(getReceipt(read, ME.id)).toEqual({ messageId: "a", isSeen: true });
  });

  it("ignores messages still being sent and chats where I have not written", () => {
    const pending = [msg("a", ME, "2026-10-29T02:00:00Z"), { ...msg("b", ME, "2026-10-29T02:01:00Z"), isPending: true }];
    expect(getReceipt(pending, ME.id)?.messageId).toBe("a");
    expect(getReceipt([msg("a", THEM, "2026-10-29T02:00:00Z")], ME.id)).toBeNull();
  });
});

describe("getPresenceLabel", () => {
  const NOW = new Date("2026-10-29T06:00:00Z");
  const status = (minutesAgo: number, isActive = false) => ({
    lastSeenAt: new Date(NOW.getTime() - minutesAgo * 60_000).toISOString(),
    isActive,
    isTyping: false,
  });

  it("reads like Messenger and hides stale or unknown presence", () => {
    expect(getPresenceLabel(status(0, true), NOW)).toBe("Active now");
    expect(getPresenceLabel(status(5), NOW)).toBe("Active 5m ago");
    expect(getPresenceLabel(status(180), NOW)).toBe("Active 3h ago");
    expect(getPresenceLabel(status(60 * 30), NOW)).toBeNull();
    expect(getPresenceLabel({ lastSeenAt: null, isActive: false, isTyping: false }, NOW)).toBeNull();
  });
});

describe("sendMessageSchema", () => {
  it("trims, rejects blank and over-long messages", () => {
    expect(sendMessageSchema.parse({ body: "  hi  " }).body).toBe("hi");
    expect(sendMessageSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(sendMessageSchema.safeParse({ body: "x".repeat(2001) }).success).toBe(false);
  });
});
