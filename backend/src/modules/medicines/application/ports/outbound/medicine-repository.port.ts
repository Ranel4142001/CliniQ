import type { Medicine, MedicineBatch, StockMovementType } from "@prisma/client";
import type {
  MedicineBatchWithMedicine,
  StockMovementWithRelations,
} from "@backend/modules/medicines/application/dto/medicine.types";
import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";

export type MedicineWithBatches = Medicine & { batches: MedicineBatch[] };

export interface MedicineQuery {
  search?: string;
  isArchived?: boolean;
  skip?: number;
  take?: number;
}

export interface NewMedicine {
  name: string;
  genericName?: string | null;
  dosageForm: string;
  strength: string;
  unit: string;
  reorderLevel?: number;
}

export type MedicineChanges = Partial<NewMedicine> & { isArchived?: boolean };

export interface NewStockMovement {
  medicineId: string;
  batchId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  performedById: string;
  prescriptionId?: string | null;
}

export interface MedicineRepositoryPort {
  findAll(query: MedicineQuery): Promise<MedicineWithBatches[]>;
  countAll(query: Omit<MedicineQuery, "skip" | "take">): Promise<number>;
  /** Medicine with all batches, earliest expiry first. Pass `tx` to read inside a dispense. */
  findById(id: string, tx?: TransactionContext): Promise<MedicineWithBatches | null>;
  findByName(name: string, strength: string, dosageForm: string): Promise<Medicine | null>;
  create(data: NewMedicine): Promise<MedicineWithBatches>;
  update(id: string, data: MedicineChanges): Promise<MedicineWithBatches>;

  /** Adds stock to a batch, creating it if it does not exist yet. Atomic (no duplicate batches). */
  addStockToBatch(
    data: { medicineId: string; batchNo: string; expiryDate: Date; quantity: number },
    tx?: TransactionContext
  ): Promise<MedicineBatch>;
  /**
   * Atomically removes `quantity` from a batch only if at least that much is left.
   * Returns false when concurrent changes left too little stock (nothing is deducted).
   */
  deductFromBatch(batchId: string, quantity: number, tx?: TransactionContext): Promise<boolean>;

  createMovement(
    data: NewStockMovement,
    tx?: TransactionContext
  ): Promise<StockMovementWithRelations>;
  listMovements(params: {
    medicineId?: string;
    skip?: number;
    take?: number;
  }): Promise<StockMovementWithRelations[]>;
  countMovements(params: { medicineId?: string }): Promise<number>;
  findExpiringBatches(startDate: Date, endDate: Date): Promise<MedicineBatchWithMedicine[]>;
  findExpiredBatches(cutoffDate: Date): Promise<MedicineBatchWithMedicine[]>;
}
