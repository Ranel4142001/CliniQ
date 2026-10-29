import type { MedicineRepositoryPort } from "@backend/modules/medicines/application/ports/outbound/medicine-repository.port";
import type { AuditAction, AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import type {
  TransactionContext,
  TransactionRunner,
} from "@backend/shared/application/ports/transaction.port";
import { calculateStockStatus } from "@backend/modules/medicines/domain/services/stock-status";
import { calculateFefoDeductions } from "@backend/modules/medicines/domain/services/fefo-deduction";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "@backend/shared/domain/errors/app-error";
import {
  getPaginationSkipTake,
  buildPaginatedResponse,
} from "@backend/shared/application/pagination";
import {
  MEDICINE_CONFIG,
  STOCK_STATUS,
} from "@backend/modules/medicines/domain/constants/medicine.constants";
import type { StockMovementType } from "@prisma/client";
import type {
  CreateMedicineInput,
  UpdateMedicineInput,
  StockInInput,
  StockOutInput,
  AdjustmentInput,
  ListMedicinesInput,
  ListMovementsInput,
} from "@backend/modules/medicines/application/dto/medicine.schema";
import type {
  MedicineWithStock,
  AlertsDTO,
} from "@backend/modules/medicines/application/dto/medicine.types";

export interface MedicineServiceDeps {
  medicineRepository: MedicineRepositoryPort;
  transactions: TransactionRunner;
  auditLog: AuditLogPort;
}

export class MedicineService {
  constructor(private readonly deps: MedicineServiceDeps) {}

  async listMedicines(params: ListMedicinesInput) {
    const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);
    const [medicines, total] = await Promise.all([
      this.deps.medicineRepository.findAll({
        search: params.search,
        isArchived: params.isArchived,
        skip,
        take,
      }),
      this.deps.medicineRepository.countAll({
        search: params.search,
        isArchived: params.isArchived,
      }),
    ]);

    const items: MedicineWithStock[] = medicines.map((med) => {
      const stockStatus = calculateStockStatus(med.batches, med.reorderLevel);
      const totalStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
      return { ...med, stockStatus, totalStock };
    });

    return buildPaginatedResponse(items, total, params.page, params.pageSize);
  }

  async getMedicine(id: string): Promise<MedicineWithStock> {
    const med = await this.deps.medicineRepository.findById(id);
    if (!med) {
      throw new NotFoundError("Medicine not found");
    }
    const stockStatus = calculateStockStatus(med.batches, med.reorderLevel);
    const totalStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
    return { ...med, stockStatus, totalStock };
  }

  async createMedicine(
    user: { id: string },
    input: CreateMedicineInput
  ): Promise<MedicineWithStock> {
    const existing = await this.deps.medicineRepository.findByName(
      input.name,
      input.strength,
      input.dosageForm
    );
    if (existing) {
      throw new ConflictError(
        `Medicine "${input.name} ${input.strength} (${input.dosageForm})" already exists.`
      );
    }

    const created = await this.deps.medicineRepository.create(input);
    await this.logAudit(user.id, "CREATE_MEDICINE", created.id, { name: created.name });

    return {
      ...created,
      stockStatus: calculateStockStatus([], created.reorderLevel),
      totalStock: 0,
    };
  }

  async updateMedicine(
    user: { id: string },
    id: string,
    input: UpdateMedicineInput
  ): Promise<MedicineWithStock> {
    const existing = await this.deps.medicineRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Medicine not found");
    }

    if (input.name || input.strength || input.dosageForm) {
      const name = input.name ?? existing.name;
      const strength = input.strength ?? existing.strength;
      const dosageForm = input.dosageForm ?? existing.dosageForm;
      const duplicate = await this.deps.medicineRepository.findByName(name, strength, dosageForm);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "Another medicine with this name, strength, and dosage form already exists."
        );
      }
    }

    const updated = await this.deps.medicineRepository.update(id, input);
    await this.logAudit(user.id, "UPDATE_MEDICINE", updated.id, { changes: input });

    const stockStatus = calculateStockStatus(updated.batches, updated.reorderLevel);
    const totalStock = updated.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
    return { ...updated, stockStatus, totalStock };
  }

  async stockIn(user: { id: string }, medicineId: string, input: StockInInput) {
    const med = await this.deps.medicineRepository.findById(medicineId);
    if (!med) throw new NotFoundError("Medicine not found");
    if (med.isArchived) throw new ConflictError("Cannot add stock to an archived medicine.");

    const expiryDate = new Date(input.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate <= today) {
      throw new ValidationError(
        "Cannot stock in expired batch. Expiry date must be in the future."
      );
    }

    return this.deps.transactions.run(async (tx) => {
      const batch = await this.deps.medicineRepository.addStockToBatch(
        { medicineId, batchNo: input.batchNo, expiryDate, quantity: input.quantity },
        tx
      );
      const batchId = batch.id;

      const movement = await this.deps.medicineRepository.createMovement(
        {
          medicineId,
          batchId,
          type: "STOCK_IN",
          quantity: input.quantity,
          reason: "Stock In",
          performedById: user.id,
        },
        tx
      );

      return movement;
    });
  }

  async stockOut(user: { id: string }, medicineId: string, input: StockOutInput) {
    const med = await this.deps.medicineRepository.findById(medicineId);
    if (!med) throw new NotFoundError("Medicine not found");
    if (med.isArchived) throw new ConflictError("Cannot remove stock from an archived medicine.");

    return this.dispenseMedicine({
      medicineId,
      quantity: input.quantity,
      performedById: user.id,
      reason: input.reason || "Manual Stock Out",
      type: "STOCK_OUT",
      batchId: input.batchId,
    });
  }

  async adjustment(user: { id: string }, medicineId: string, input: AdjustmentInput) {
    const med = await this.deps.medicineRepository.findById(medicineId);
    if (!med) throw new NotFoundError("Medicine not found");
    if (med.isArchived) throw new ConflictError("Cannot adjust an archived medicine.");
    if (!input.reason?.trim())
      throw new ValidationError("Reason is required for inventory adjustments.");

    return this.dispenseMedicine({
      medicineId,
      quantity: input.quantity,
      performedById: user.id,
      reason: input.reason.trim(),
      type: "ADJUSTMENT",
      batchId: input.batchId,
    });
  }

  async dispenseMedicine(params: {
    medicineId: string;
    quantity: number;
    performedById: string;
    prescriptionId?: string | null;
    reason?: string | null;
    type?: StockMovementType;
    batchId?: string;
    tx?: TransactionContext;
  }) {
    const run = async (tx: TransactionContext) => {
      const med = await this.deps.medicineRepository.findById(params.medicineId, tx);
      if (!med) throw new NotFoundError("Medicine not found");
      if (med.isArchived)
        throw new ConflictError("Archived medicines cannot be prescribed or dispensed.");

      const deductions = params.batchId
        ? [this.selectBatch(med.batches, params.batchId, params.quantity)]
        : calculateFefoDeductions(
            med.batches.filter((b) => b.quantity > 0),
            params.quantity
          );

      const movements = [];
      for (const item of deductions) {
        movements.push(await this.deductAndRecord(item, params, tx));
      }
      return movements;
    };

    return params.tx ? run(params.tx) : this.deps.transactions.run(run);
  }

  /** Validates a manually chosen batch has enough stock. */
  private selectBatch(
    batches: { id: string; batchNo: string; quantity: number }[],
    batchId: string,
    quantity: number
  ) {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) throw new NotFoundError("Selected batch not found");
    if (batch.quantity < quantity) {
      throw new ConflictError(
        `Insufficient stock in batch ${batch.batchNo}. Available: ${batch.quantity}, Requested: ${quantity}`
      );
    }
    return { batchId, quantity };
  }

  private async deductAndRecord(
    item: { batchId: string; quantity: number },
    params: {
      medicineId: string;
      performedById: string;
      prescriptionId?: string | null;
      reason?: string | null;
      type?: StockMovementType;
    },
    tx: TransactionContext
  ) {
    const deducted = await this.deps.medicineRepository.deductFromBatch(
      item.batchId,
      item.quantity,
      tx
    );
    if (!deducted) {
      // Another transaction consumed this stock after we read it; abort rather than oversell.
      throw new ConflictError("Stock levels changed while dispensing. Please retry.");
    }
    return this.deps.medicineRepository.createMovement(
      {
        medicineId: params.medicineId,
        batchId: item.batchId,
        type: params.type ?? "STOCK_OUT",
        quantity: item.quantity,
        reason: params.reason ?? (params.prescriptionId ? "Prescription Dispensed" : null),
        performedById: params.performedById,
        prescriptionId: params.prescriptionId ?? null,
      },
      tx
    );
  }

  async getAlerts(): Promise<AlertsDTO> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringDateLimit = new Date(today);
    expiringDateLimit.setDate(expiringDateLimit.getDate() + MEDICINE_CONFIG.EXPIRING_SOON_DAYS);

    const [allMedicines, expiringSoon, expired] = await Promise.all([
      this.deps.medicineRepository.findAll({ isArchived: false }),
      this.deps.medicineRepository.findExpiringBatches(today, expiringDateLimit),
      this.deps.medicineRepository.findExpiredBatches(today),
    ]);

    const lowStock: MedicineWithStock[] = allMedicines
      .map((med) => {
        const stockStatus = calculateStockStatus(med.batches, med.reorderLevel);
        const totalStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
        return { ...med, stockStatus, totalStock };
      })
      .filter(
        (med) =>
          med.stockStatus === STOCK_STATUS.LOW_STOCK ||
          med.stockStatus === STOCK_STATUS.OUT_OF_STOCK
      );

    return {
      lowStock,
      expiringSoon,
      expired,
    };
  }

  async listMovements(params: ListMovementsInput) {
    const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);
    const [items, total] = await Promise.all([
      this.deps.medicineRepository.listMovements({ medicineId: params.medicineId, skip, take }),
      this.deps.medicineRepository.countMovements({ medicineId: params.medicineId }),
    ]);

    return buildPaginatedResponse(items, total, params.page, params.pageSize);
  }

  private async logAudit(
    actorId: string,
    action: AuditAction,
    entityId: string,
    metadata: Record<string, unknown>
  ) {
    await this.deps.auditLog.log({ actorId, action, entity: "Medicine", entityId, metadata });
  }
}
