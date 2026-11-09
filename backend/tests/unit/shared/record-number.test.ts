import { describe, it, expect, vi } from "vitest";
import { createRecordNumberGenerator } from "@backend/shared/application/record-number-generator";
import { recordNumberGenerator } from "@backend/shared/infrastructure/persistence/record-number";
import { ConflictError } from "@backend/shared/domain/errors/app-error";
import {
  formatRecordNumber,
  RECORD_NUMBER_PATTERN,
} from "@backend/shared/domain/record-number";

const today = () => "2026-11-10";

describe("formatRecordNumber", () => {
  it("is PREFIX-YEAR-MONTH-DAY-NNN with a zero-padded suffix", () => {
    expect(formatRecordNumber("PT", "2026-11-10", 482)).toBe("PT-2026-11-10-482");
    expect(formatRecordNumber("RX", "2026-01-05", 7)).toBe("RX-2026-01-05-007");
  });
});

describe("record number generator", () => {
  it("skips numbers that are already taken", async () => {
    const suffixes = [482, 482, 91];
    const generator = createRecordNumberGenerator({ today, randomSuffix: () => suffixes.shift() ?? 0 });
    const taken = new Set(["PT-2026-11-10-482"]);

    const number = await generator.next("PT", async (candidate) => taken.has(candidate));
    expect(number).toBe("PT-2026-11-10-091");
  });

  it("gives up with a clear error instead of looping forever on a full day", async () => {
    const generator = createRecordNumberGenerator({ today, randomSuffix: () => 1 });
    const isTaken = vi.fn().mockResolvedValue(true);

    await expect(generator.next("RX", isTaken)).rejects.toThrow(ConflictError);
    expect(isTaken.mock.calls.length).toBeGreaterThan(1);
  });

  it("produces well-formed, non-sequential numbers in production", async () => {
    const numbers = new Set<string>();
    for (let i = 0; i < 20; i++) {
      numbers.add(await recordNumberGenerator.next("PT", async () => false));
    }
    for (const n of numbers) expect(n).toMatch(RECORD_NUMBER_PATTERN);
    expect(numbers.size).toBeGreaterThan(10);
  });
});
