import { describe, it, expect } from "vitest";
import { calculateStockStatus } from "@backend/modules/medicines/domain/services/stock-status";
import { STOCK_STATUS } from "@backend/modules/medicines/domain/constants/medicine.constants";

describe("Stock Status Utility", () => {
  const baseDate = new Date("2026-10-20T00:00:00.000Z");

  it("returns OUT_OF_STOCK when there are no batches", () => {
    const status = calculateStockStatus([], 10, baseDate);
    expect(status).toBe(STOCK_STATUS.OUT_OF_STOCK);
  });

  it("returns OUT_OF_STOCK when all non-expired batches have 0 quantity", () => {
    const batches = [
      { expiryDate: "2026-11-01", quantity: 0 },
      { expiryDate: "2026-12-01", quantity: 0 },
    ];
    const status = calculateStockStatus(batches, 10, baseDate);
    expect(status).toBe(STOCK_STATUS.OUT_OF_STOCK);
  });

  it("returns EXPIRED when non-expired quantity is 0 but expired batches exist with quantity > 0", () => {
    const batches = [
      { expiryDate: "2026-10-15", quantity: 25 },
      { expiryDate: "2026-10-19", quantity: 10 },
    ];
    const status = calculateStockStatus(batches, 10, baseDate);
    expect(status).toBe(STOCK_STATUS.EXPIRED);
  });

  it("returns LOW_STOCK when non-expired quantity is less than or equal to reorder level", () => {
    const batches = [
      { expiryDate: "2026-11-15", quantity: 5 },
      { expiryDate: "2026-12-15", quantity: 5 },
    ];
    // total = 10, reorderLevel = 10 -> LOW_STOCK
    const status1 = calculateStockStatus(batches, 10, baseDate);
    expect(status1).toBe(STOCK_STATUS.LOW_STOCK);

    // total = 10, reorderLevel = 15 -> LOW_STOCK
    const status2 = calculateStockStatus(batches, 15, baseDate);
    expect(status2).toBe(STOCK_STATUS.LOW_STOCK);
  });

  it("returns IN_STOCK when non-expired quantity exceeds reorder level", () => {
    const batches = [
      { expiryDate: "2026-11-15", quantity: 10 },
      { expiryDate: "2026-12-15", quantity: 10 },
    ];
    // total = 20, reorderLevel = 10 -> IN_STOCK
    const status = calculateStockStatus(batches, 10, baseDate);
    expect(status).toBe(STOCK_STATUS.IN_STOCK);
  });

  it("ignores expired batches when calculating available stock", () => {
    const batches = [
      { expiryDate: "2026-10-10", quantity: 100 }, // expired
      { expiryDate: "2026-11-10", quantity: 5 }, // non-expired
    ];
    // Only 5 available non-expired stock, reorder level is 10 -> LOW_STOCK
    const status = calculateStockStatus(batches, 10, baseDate);
    expect(status).toBe(STOCK_STATUS.LOW_STOCK);
  });
});
