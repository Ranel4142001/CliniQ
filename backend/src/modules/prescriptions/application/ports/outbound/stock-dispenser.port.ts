import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";

/** Deducts stock for a dispensed prescription item (provided by the medicines module). */
export interface StockDispenserPort {
  dispense(params: {
    medicineId: string;
    quantity: number;
    performedById: string;
    prescriptionId: string;
    reason: string;
    tx: TransactionContext;
  }): Promise<unknown>;
}
