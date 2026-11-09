import { describe, it, expect } from "vitest";
import { getCounterpartStatus } from "@backend/modules/consultations/domain/services/chat-presence";

const NOW = new Date("2026-11-10T06:00:00.000Z");
const secondsAgo = (seconds: number) => new Date(NOW.getTime() - seconds * 1000);

describe("getCounterpartStatus", () => {
  it("is unknown until the other participant opens the chat", () => {
    expect(getCounterpartStatus(null, null, NOW)).toEqual({
      lastSeenAt: null,
      isActive: false,
      isTyping: false,
    });
  });

  it("is active only when seen recently", () => {
    const active = getCounterpartStatus({ lastSeenAt: secondsAgo(10), typingAt: null }, null, NOW);
    const away = getCounterpartStatus({ lastSeenAt: secondsAgo(120), typingAt: null }, null, NOW);
    expect(active.isActive).toBe(true);
    expect(away.isActive).toBe(false);
    expect(away.lastSeenAt).toEqual(secondsAgo(120));
  });

  it("shows typing only for a fresh ping", () => {
    const fresh = { lastSeenAt: NOW, typingAt: secondsAgo(2) };
    const stale = { lastSeenAt: NOW, typingAt: secondsAgo(30) };
    expect(getCounterpartStatus(fresh, null, NOW).isTyping).toBe(true);
    expect(getCounterpartStatus(stale, null, NOW).isTyping).toBe(false);
  });

  it("stops typing once they send a message after the ping", () => {
    const presence = { lastSeenAt: NOW, typingAt: secondsAgo(3) };
    expect(getCounterpartStatus(presence, secondsAgo(1), NOW).isTyping).toBe(false);
    expect(getCounterpartStatus(presence, secondsAgo(5), NOW).isTyping).toBe(true);
  });
});
