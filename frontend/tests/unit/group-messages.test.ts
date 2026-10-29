import { describe, it, expect } from "vitest";
import { getSeenMessageId, groupMessages, type ChatMessageView } from "@/features/consultations/utils/group-messages";
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
});

describe("getSeenMessageId", () => {
  it("returns my latest message only when it has been read", () => {
    const unread = [msg("a", ME, "2026-10-29T02:00:00Z", "2026-10-29T02:01:00Z"), msg("b", ME, "2026-10-29T02:02:00Z")];
    expect(getSeenMessageId(unread, ME.id)).toBeNull();

    const read = [msg("a", ME, "2026-10-29T02:00:00Z", "2026-10-29T02:01:00Z"), msg("b", THEM, "2026-10-29T02:02:00Z")];
    expect(getSeenMessageId(read, ME.id)).toBe("a");
  });
});

describe("sendMessageSchema", () => {
  it("trims, rejects blank and over-long messages", () => {
    expect(sendMessageSchema.parse({ body: "  hi  " }).body).toBe("hi");
    expect(sendMessageSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(sendMessageSchema.safeParse({ body: "x".repeat(2001) }).success).toBe(false);
  });
});
