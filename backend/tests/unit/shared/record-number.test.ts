import { describe, it, expect, vi } from "vitest";
import { createRecordNumberGenerator } from "@backend/shared/application/record-number-generator";
import { recordNumberGenerator } from "@backend/shared/infrastructure/persistence/record-number";
import { ConflictError } from "@backend/shared/domain/errors/app-error";
import {
  formatRecordNumber,
  RECORD_NUMBER_PATTERN,
} from "@backend/shared/domain/record-number";

const today = () => "261110";

/** A table holding `existing` numbers. */
function storeWith(existing: string[]) {
  const taken = new Set(existing);
  return {
    isTaken: async (candidate: string) => taken.has(candidate),
    countIssued: async (dayPrefix: string) => [...taken].filter((n) => n.startsWith(dayPrefix)).length,
  };
}

describe("formatRecordNumber", () => {
  it("is PREFIX-YYMMDD-<counter><2 random digits>", () => {
    expect(formatRecordNumber("PT", "261110", 1, 47)).toBe("PT-261110-147");
    expect(formatRecordNumber("RX", "260105", 12, 7)).toBe("RX-260105-1207");
  });
});

describe("record number generator", () => {
  it("numbers each day's records 1, 2, 3… and ignores other days", async () => {
    const generator = createRecordNumberGenerator({ today, randomEnding: () => 47 });
    const store = storeWith(["PT-261110-183", "PT-261110-209", "PT-261109-150", "RX-261110-111"]);

    expect(await generator.next("PT", store)).toBe("PT-261110-347");
  });

  it("starts at 1 on a new day", async () => {
    const generator = createRecordNumberGenerator({ today, randomEnding: () => 5 });
    expect(await generator.next("RX", storeWith([]))).toBe("RX-261110-105");
  });

  it("draws new random digits when the candidate is taken", async () => {
    const endings = [47, 47, 91];
    const generator = createRecordNumberGenerator({ today, randomEnding: () => endings.shift() ?? 0 });
    const store = { isTaken: async (c: string) => c === "PT-261110-147", countIssued: async () => 0 };

    expect(await generator.next("PT", store)).toBe("PT-261110-191");
  });

  it("gives up with a clear error instead of looping forever", async () => {
    const generator = createRecordNumberGenerator({ today, randomEnding: () => 1 });
    const isTaken = vi.fn().mockResolvedValue(true);

    await expect(generator.next("RX", { isTaken, countIssued: async () => 0 })).rejects.toThrow(ConflictError);
    expect(isTaken.mock.calls.length).toBeGreaterThan(1);
  });

  it("produces well-formed numbers in production", async () => {
    const number = await recordNumberGenerator.next("PT", storeWith([]));
    expect(number).toMatch(RECORD_NUMBER_PATTERN);
    expect(number).toMatch(/^PT-\d{6}-1\d{2}$/);
  });
});
