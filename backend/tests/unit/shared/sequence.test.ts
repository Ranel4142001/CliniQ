import { describe, it, expect } from "vitest";
import {
  formatSequenceNumber,
  parseSequenceNumber,
  nextSequenceNumber,
} from "@backend/shared/infrastructure/persistence/sequence";

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

  it("increments and generates next sequence number atomically", async () => {
    let mockValue = 0;
    const mockClient = {
      counter: {
        upsert: async () => {
          mockValue += 1;
          return { key: "PT-2026", value: mockValue };
        },
      },
    };

    const first = await nextSequenceNumber(mockClient, "PT-2026");
    expect(first).toBe("PT-2026-0001");

    const second = await nextSequenceNumber(mockClient, "PT-2026");
    expect(second).toBe("PT-2026-0002");
  });
});
