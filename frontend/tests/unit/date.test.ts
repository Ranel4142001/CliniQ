import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatTime } from "@/lib/date";

describe("Date Formatting Utilities", () => {
  it("formats dates gracefully", () => {
    const isoString = "2026-10-17T00:00:00.000Z";
    expect(formatDate(isoString)).toMatch(/Oct 17, 2026/);
  });

  it("handles null and undefined dates gracefully", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDateTime(null)).toBe("-");
    expect(formatTime(null)).toBe("-");
  });
});
