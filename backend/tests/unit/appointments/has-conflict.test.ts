import { describe, it, expect } from "vitest";
import { hasConflict } from "@backend/modules/appointments/domain/services/has-conflict";

describe("hasConflict Utility", () => {
  const existing = [
    {
      id: "appt-1",
      scheduledAt: "2026-10-21T01:00:00.000Z", // 9:00 AM Manila
      endsAt: "2026-10-21T01:30:00.000Z", // 9:30 AM Manila
      status: "CONFIRMED",
    },
    {
      id: "appt-2",
      scheduledAt: "2026-10-21T02:00:00.000Z", // 10:00 AM Manila
      endsAt: "2026-10-21T02:30:00.000Z", // 10:30 AM Manila
      status: "PENDING",
    },
    {
      id: "appt-cancelled",
      scheduledAt: "2026-10-21T03:00:00.000Z", // 11:00 AM Manila
      endsAt: "2026-10-21T03:30:00.000Z", // 11:30 AM Manila
      status: "CANCELLED",
    },
  ];

  it("detects exact overlap with an existing appointment", () => {
    const conflict = hasConflict("2026-10-21T01:00:00.000Z", "2026-10-21T01:30:00.000Z", existing);
    expect(conflict).toBe(true);
  });

  it("detects partial overlap (starts before, ends inside)", () => {
    const conflict = hasConflict("2026-10-21T00:45:00.000Z", "2026-10-21T01:15:00.000Z", existing);
    expect(conflict).toBe(true);
  });

  it("detects partial overlap (starts inside, ends after)", () => {
    const conflict = hasConflict("2026-10-21T01:15:00.000Z", "2026-10-21T01:45:00.000Z", existing);
    expect(conflict).toBe(true);
  });

  it("allows adjacent non-overlapping appointments", () => {
    // 09:30 AM to 10:00 AM sits right between appt-1 and appt-2
    const conflict = hasConflict("2026-10-21T01:30:00.000Z", "2026-10-21T02:00:00.000Z", existing);
    expect(conflict).toBe(false);
  });

  it("ignores CANCELLED appointments", () => {
    const conflict = hasConflict("2026-10-21T03:00:00.000Z", "2026-10-21T03:30:00.000Z", existing);
    expect(conflict).toBe(false);
  });

  it("ignores the excluded appointment ID during rescheduling", () => {
    const conflict = hasConflict(
      "2026-10-21T01:00:00.000Z",
      "2026-10-21T01:30:00.000Z",
      existing,
      "appt-1" // Excluded from conflict check
    );
    expect(conflict).toBe(false);
  });
});
