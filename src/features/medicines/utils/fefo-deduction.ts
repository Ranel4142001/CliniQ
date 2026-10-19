import { ConflictError } from "@/shared/lib/errors";
import type { FefoDeductionItem } from "../types/medicine.types";

export interface FefoBatchItem {
  id: string;
  expiryDate: Date | string;
  quantity: number;
}

/**
 * Calculates FEFO (First-Expired, First-Out) deductions.
 * Deductions always consume earliest-expiring non-expired batch first,
 * spanning multiple batches if needed.
 */
export function calculateFefoDeductions(
  batches: FefoBatchItem[],
  requestedQty: number,
  now: Date = new Date()
): FefoDeductionItem[] {
  if (requestedQty <= 0) {
    throw new ConflictError("Requested quantity must be greater than zero");
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Filter valid non-expired batches with positive stock
  const validBatches = batches
    .filter((b) => {
      const exp = new Date(b.expiryDate);
      exp.setHours(0, 0, 0, 0);
      return exp > today && b.quantity > 0;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const totalAvailable = validBatches.reduce((sum, b) => sum + b.quantity, 0);

  if (totalAvailable < requestedQty) {
    throw new ConflictError(
      `Insufficient non-expired stock. Requested: ${requestedQty}, Available: ${totalAvailable}`
    );
  }

  const deductions: FefoDeductionItem[] = [];
  let remaining = requestedQty;

  for (const batch of validBatches) {
    if (remaining <= 0) break;
    const deduct = Math.min(batch.quantity, remaining);
    deductions.push({
      batchId: batch.id,
      quantity: deduct,
    });
    remaining -= deduct;
  }

  return deductions;
}
