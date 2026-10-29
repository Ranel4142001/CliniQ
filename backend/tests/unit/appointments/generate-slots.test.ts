import { describe, it, expect } from "vitest";
import { generateSlots } from "@backend/modules/appointments/domain/services/generate-slots";

describe("generateSlots Utility", () => {
  // Wednesday, Oct 21, 2026 (Working Day)
  const wednesday = "2026-10-21";
  // Sunday, Oct 25, 2026 (Weekend)
  const sunday = "2026-10-25";

  it("generates exactly 18 half-hour slots for a working weekday (8:00 AM to 5:00 PM)", () => {
    // Simulated time: early morning before 8:00 AM Manila (07:00 AM Manila = 2026-10-20 23:00:00 UTC)
    const earlyMorning = new Date("2026-10-20T23:00:00.000Z");
    const slots = generateSlots(wednesday, [], earlyMorning);

    expect(slots.length).toBe(18);
    expect(slots[0].timeLabel).toBe("8:00 AM - 8:30 AM");
    expect(slots[17].timeLabel).toBe("4:30 PM - 5:00 PM");
    expect(slots.every((s) => s.isAvailable)).toBe(true);
  });

  it("returns zero slots for weekends (Sunday/Saturday)", () => {
    const slots = generateSlots(sunday, []);
    expect(slots.length).toBe(0);
  });

  it("marks past slots as unavailable", () => {
    // Current time: 10:15 AM Manila on Oct 21, 2026 (= 2026-10-21 02:15:00 UTC)
    const midMorning = new Date("2026-10-21T02:15:00.000Z");
    const slots = generateSlots(wednesday, [], midMorning);

    // Slots at 8:00, 8:30, 9:00, 9:30, 10:00 (first 5 slots) should be past
    expect(slots[0].isAvailable).toBe(false);
    expect(slots[0].reason).toContain("past");
    expect(slots[4].isAvailable).toBe(false); // 10:00 AM - 10:30 AM starts before 10:15 AM

    // Slot starting at 10:30 AM should be available
    expect(slots[5].isAvailable).toBe(true);
  });

  it("marks booked slots as unavailable", () => {
    const earlyMorning = new Date("2026-10-20T23:00:00.000Z");
    // Slot 1: 08:00 AM Manila = 2026-10-21T00:00:00.000Z to 2026-10-21T00:30:00.000Z
    const booked = [
      {
        scheduledAt: "2026-10-21T00:00:00.000Z",
        endsAt: "2026-10-21T00:30:00.000Z",
        status: "CONFIRMED",
      },
    ];

    const slots = generateSlots(wednesday, booked, earlyMorning);
    expect(slots[0].isAvailable).toBe(false);
    expect(slots[0].reason).toContain("already booked");
    expect(slots[1].isAvailable).toBe(true);
  });
});
