import { describe, it, expect } from "vitest";
import { canJoinMeeting } from "@/features/consultations/utils/can-join-meeting";

describe("canJoinMeeting business rule (15 min before to 60 min after)", () => {
  const meetingUrl = "https://meet.google.com/abc-defg-hij";
  const scheduledTime = new Date("2026-10-20T10:00:00.000Z");

  it("returns canJoin=false if meeting URL is missing or empty", () => {
    const res1 = canJoinMeeting(scheduledTime, undefined);
    expect(res1.canJoin).toBe(false);
    expect(res1.reason).toContain("No meeting link");

    const res2 = canJoinMeeting(scheduledTime, "");
    expect(res2.canJoin).toBe(false);

    const res3 = canJoinMeeting(scheduledTime, "   ");
    expect(res3.canJoin).toBe(false);
  });

  it("disallows joining more than 15 minutes before the start time", () => {
    // 16 minutes before: 09:44:00
    const now = new Date("2026-10-20T09:44:00.000Z");
    const res = canJoinMeeting(scheduledTime, meetingUrl, now);

    expect(res.canJoin).toBe(false);
    expect(res.minutesUntilOpen).toBe(1);
    expect(res.reason).toContain("Meeting link will open");
  });

  it("allows joining exactly 15 minutes before scheduled start time", () => {
    // Exactly 15 minutes before: 09:45:00
    const now = new Date("2026-10-20T09:45:00.000Z");
    const res = canJoinMeeting(scheduledTime, meetingUrl, now);

    expect(res.canJoin).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it("allows joining during the scheduled appointment window", () => {
    // During: 10:15:00
    const now = new Date("2026-10-20T10:15:00.000Z");
    const res = canJoinMeeting(scheduledTime, meetingUrl, now);

    expect(res.canJoin).toBe(true);
  });

  it("allows joining up to 60 minutes after scheduled start time", () => {
    // Exactly 60 minutes after: 11:00:00
    const now = new Date("2026-10-20T11:00:00.000Z");
    const res = canJoinMeeting(scheduledTime, meetingUrl, now);

    expect(res.canJoin).toBe(true);
  });

  it("disallows joining more than 60 minutes after scheduled start time (expired)", () => {
    // 61 minutes after: 11:01:00
    const now = new Date("2026-10-20T11:01:00.000Z");
    const res = canJoinMeeting(scheduledTime, meetingUrl, now);

    expect(res.canJoin).toBe(false);
    expect(res.isExpired).toBe(true);
    expect(res.reason).toContain("expired");
  });

  it("handles string date inputs safely", () => {
    const now = new Date("2026-10-20T10:00:00.000Z");
    const res = canJoinMeeting("2026-10-20T10:00:00.000Z", meetingUrl, now);
    expect(res.canJoin).toBe(true);
  });
});
