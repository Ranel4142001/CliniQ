import { describe, it, expect } from "vitest";
import { formatSequenceNumber, parseSequenceNumber } from "@/shared/lib/sequence";

describe("Sequence Number Utilities", () => {
  it("formats patient sequence numbers with default 4-digit padding", () => {
    expect(formatSequenceNumber("PT", 2026, 1)).toBe("PT-2026-0001");
    expect(formatSequenceNumber("PT", 2026, 42)).toBe("PT-2026-0042");
    expect(formatSequenceNumber("PT", 2026, 9999)).toBe("PT-2026-9999");
  });

  it("formats prescription sequence numbers with RX prefix", () => {
    expect(formatSequenceNumber("RX", 2026, 5)).toBe("RX-2026-0005");
  });

  it("correctly parses valid sequence numbers", () => {
    const parsed = parseSequenceNumber("PT-2026-0123");
    expect(parsed).toEqual({
      prefix: "PT",
      year: 2026,
      sequence: 123,
    });
  });

  it("returns null for malformed sequence numbers", () => {
    expect(parseSequenceNumber("INVALID")).toBeNull();
    expect(parseSequenceNumber("PT-INVALID-001")).toBeNull();
  });
});
