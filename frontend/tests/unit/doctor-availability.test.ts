import { describe, it, expect } from "vitest";
import { summarizeAvailability } from "@/features/dashboard/utils/doctor-availability";
import type { AppointmentSlot } from "@backend/contracts";

const slot = (label: string, end: string, isAvailable: boolean): AppointmentSlot => ({
  start: end,
  end,
  timeLabel: label,
  isAvailable,
});

describe("summarizeAvailability", () => {
  it("reports the clinic as closed when there are no slots", () => {
    expect(summarizeAvailability([]).status).toBe("CLOSED");
  });

  it("gives the hours, the next open slot and how many are open", () => {
    const result = summarizeAvailability([
      slot("8:00 AM - 8:30 AM", "2026-11-10T00:30:00Z", false),
      slot("8:30 AM - 9:00 AM", "2026-11-10T01:00:00Z", true),
      slot("4:30 PM - 5:00 PM", "2026-11-10T09:00:00Z", true),
    ]);
    expect(result).toEqual({
      status: "AVAILABLE",
      hours: "8:00 AM – 5:00 PM",
      nextFree: "8:30 AM",
      openSlots: 2,
    });
  });

  it("tells fully booked apart from a day that is over", () => {
    const slots = [slot("4:30 PM - 5:00 PM", "2026-11-10T09:00:00Z", false)];
    expect(summarizeAvailability(slots, new Date("2026-11-10T08:00:00Z")).status).toBe(
      "FULLY_BOOKED"
    );
    expect(summarizeAvailability(slots, new Date("2026-11-10T10:00:00Z")).status).toBe(
      "DONE_FOR_TODAY"
    );
  });
});
