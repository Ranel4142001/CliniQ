import { describe, it, expect } from "vitest";
import { calculateFefoDeductions } from "@/features/medicines/utils/fefo-deduction";
import { ConflictError } from "@/shared/lib/errors";

describe("FEFO Deduction Utility", () => {
  const baseDate = new Date("2026-10-20T00:00:00.000Z");

  it("deducts from a single batch when quantity is sufficient", () => {
    const batches = [
      { id: "batch-1", expiryDate: "2026-11-01", quantity: 50 },
    ];

    const deductions = calculateFefoDeductions(batches, 20, baseDate);
    expect(deductions).toEqual([
      { batchId: "batch-1", quantity: 20 },
    ]);
  });

  it("spans multiple batches in expiry order (earliest expiring first)", () => {
    const batches = [
      { id: "batch-2", expiryDate: "2026-12-01", quantity: 30 },
      { id: "batch-1", expiryDate: "2026-11-01", quantity: 15 },
    ];

    // Requesting 25: 15 from batch-1, then 10 from batch-2
    const deductions = calculateFefoDeductions(batches, 25, baseDate);
    expect(deductions).toEqual([
      { batchId: "batch-1", quantity: 15 },
      { batchId: "batch-2", quantity: 10 },
    ]);
  });

  it("succeeds when requested quantity exactly equals available stock", () => {
    const batches = [
      { id: "batch-1", expiryDate: "2026-11-01", quantity: 10 },
      { id: "batch-2", expiryDate: "2026-12-01", quantity: 20 },
    ];

    const deductions = calculateFefoDeductions(batches, 30, baseDate);
    expect(deductions).toEqual([
      { batchId: "batch-1", quantity: 10 },
      { batchId: "batch-2", quantity: 20 },
    ]);
  });

  it("throws ConflictError when requested quantity exceeds available stock", () => {
    const batches = [
      { id: "batch-1", expiryDate: "2026-11-01", quantity: 10 },
    ];

    expect(() => calculateFefoDeductions(batches, 15, baseDate)).toThrow(ConflictError);
  });

  it("skips expired batches and throws ConflictError if remaining valid stock is insufficient", () => {
    const batches = [
      { id: "batch-expired", expiryDate: "2026-10-10", quantity: 50 },
      { id: "batch-valid", expiryDate: "2026-11-10", quantity: 5 },
    ];

    // Requesting 10 when valid is only 5 (even though total raw is 55)
    expect(() => calculateFefoDeductions(batches, 10, baseDate)).toThrow(ConflictError);

    // Requesting 5 should succeed using only batch-valid
    const deductions = calculateFefoDeductions(batches, 5, baseDate);
    expect(deductions).toEqual([
      { batchId: "batch-valid", quantity: 5 },
    ]);
  });

  it("throws ConflictError for negative or zero requested quantity", () => {
    const batches = [
      { id: "batch-1", expiryDate: "2026-11-01", quantity: 10 },
    ];

    expect(() => calculateFefoDeductions(batches, 0, baseDate)).toThrow(ConflictError);
    expect(() => calculateFefoDeductions(batches, -5, baseDate)).toThrow(ConflictError);
  });
});
