import { describe, it, expect } from "vitest";
import {
  canTransitionStatus,
  isValidGoogleMeetUrl,
  canPatientCancelAppointment,
  validateStatusTransition,
} from "@/features/appointments/utils/appointment-transitions";

describe("Appointment Transitions & State Machine", () => {
  it("allows valid status transitions", () => {
    // PENDING -> CONFIRMED | CANCELLED
    expect(canTransitionStatus("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransitionStatus("PENDING", "CANCELLED")).toBe(true);

    // CONFIRMED -> COMPLETED | CANCELLED | NO_SHOW
    expect(canTransitionStatus("CONFIRMED", "COMPLETED")).toBe(true);
    expect(canTransitionStatus("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransitionStatus("CONFIRMED", "NO_SHOW")).toBe(true);

    // Same status
    expect(canTransitionStatus("PENDING", "PENDING")).toBe(true);
  });

  it("rejects invalid status jumps", () => {
    // PENDING cannot jump directly to COMPLETED or NO_SHOW
    expect(canTransitionStatus("PENDING", "COMPLETED")).toBe(false);
    expect(canTransitionStatus("PENDING", "NO_SHOW")).toBe(false);

    // Terminal statuses cannot transition to anything
    expect(canTransitionStatus("COMPLETED", "CONFIRMED")).toBe(false);
    expect(canTransitionStatus("CANCELLED", "PENDING")).toBe(false);
    expect(canTransitionStatus("NO_SHOW", "CONFIRMED")).toBe(false);
  });

  it("validates Google Meet URLs", () => {
    expect(isValidGoogleMeetUrl("https://meet.google.com/abc-defg-hij")).toBe(true);
    expect(isValidGoogleMeetUrl("http://meet.google.com/abc-defg-hij")).toBe(true);
    expect(isValidGoogleMeetUrl("https://zoom.us/j/123456789")).toBe(false);
    expect(isValidGoogleMeetUrl("invalid-link")).toBe(false);
    expect(isValidGoogleMeetUrl(null)).toBe(false);
    expect(isValidGoogleMeetUrl("")).toBe(false);
  });

  it("enforces that ONLINE appointments require a Google Meet link when confirmed", () => {
    const resWithoutUrl = validateStatusTransition({
      currentStatus: "PENDING",
      nextStatus: "CONFIRMED",
      type: "ONLINE",
      meetingUrl: null,
      scheduledAt: "2026-10-21T01:00:00.000Z",
      role: "STAFF",
    });
    expect(resWithoutUrl.valid).toBe(false);
    expect(resWithoutUrl.error).toContain("Google Meet link");

    const resWithUrl = validateStatusTransition({
      currentStatus: "PENDING",
      nextStatus: "CONFIRMED",
      type: "ONLINE",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      scheduledAt: "2026-10-21T01:00:00.000Z",
      role: "STAFF",
    });
    expect(resWithUrl.valid).toBe(true);
  });

  it("enforces 2-hour cancellation deadline for patients", () => {
    const scheduledAt = new Date("2026-10-21T10:00:00.000Z");

    // 3 hours before -> allowed
    const threeHoursBefore = new Date("2026-10-21T07:00:00.000Z");
    expect(canPatientCancelAppointment(scheduledAt, threeHoursBefore).allowed).toBe(true);

    // 1 hour before -> rejected
    const oneHourBefore = new Date("2026-10-21T09:00:00.000Z");
    const check = canPatientCancelAppointment(scheduledAt, oneHourBefore);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("at least 2 hours");
  });

  it("requires a reason when cancelling an appointment", () => {
    const resultNoReason = validateStatusTransition({
      currentStatus: "CONFIRMED",
      nextStatus: "CANCELLED",
      type: "IN_PERSON",
      scheduledAt: "2026-10-21T10:00:00.000Z",
      role: "STAFF",
      cancelReason: "",
    });
    expect(resultNoReason.valid).toBe(false);
    expect(resultNoReason.error).toContain("reason is required");
  });
});
