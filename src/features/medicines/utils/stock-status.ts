import { STOCK_STATUS, type StockStatus } from "../constants/medicine.constants";

export interface BatchStockItem {
  expiryDate: Date | string;
  quantity: number;
}

/**
 * Calculates stock status based on non-expired stock and reorder level.
 * This is the single source of truth for stock status calculation.
 */
export function calculateStockStatus(
  batches: BatchStockItem[],
  reorderLevel: number,
  now: Date = new Date()
): StockStatus {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let nonExpiredQty = 0;
  let expiredQty = 0;

  for (const batch of batches) {
    const exp = new Date(batch.expiryDate);
    exp.setHours(0, 0, 0, 0);

    if (exp <= today) {
      expiredQty += Math.max(0, batch.quantity);
    } else {
      nonExpiredQty += Math.max(0, batch.quantity);
    }
  }

  if (nonExpiredQty === 0) {
    if (expiredQty > 0) {
      return STOCK_STATUS.EXPIRED;
    }
    return STOCK_STATUS.OUT_OF_STOCK;
  }

  if (nonExpiredQty <= reorderLevel) {
    return STOCK_STATUS.LOW_STOCK;
  }

  return STOCK_STATUS.IN_STOCK;
}
