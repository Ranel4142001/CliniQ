import { medicineRepository } from "../repositories/medicine.repository";
import { calculateStockStatus } from "../utils/stock-status";
import { calculateFefoDeductions } from "../utils/fefo-deduction";
import { NotFoundError, ConflictError, ValidationError } from "@/shared/lib/errors";
import { getPaginationSkipTake, buildPaginatedResponse } from "@/shared/lib/pagination";
import { prisma } from "@/shared/lib/prisma";
import { MEDICINE_CONFIG, STOCK_STATUS } from "../constants/medicine.constants";
import type { Prisma, StockMovementType } from "@prisma/client";
import type {
  CreateMedicineInput,
  UpdateMedicineInput,
  StockInInput,
  StockOutInput,
  AdjustmentInput,
  ListMedicinesInput,
  ListMovementsInput,
} from "../schemas/medicine.schema";
import type {
  MedicineWithStock,
  AlertsDTO,
} from "../types/medicine.types";

export class MedicineService {
  async listMedicines(params: ListMedicinesInput) {
    const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);
    const [medicines, total] = await Promise.all([
      medicineRepository.findAll({
        search: params.search,
        isArchived: params.isArchived,
        skip,
        take,
      }),
      medicineRepository.countAll({
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
    const med = await medicineRepository.findById(id);
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
    const existing = await medicineRepository.findByName(
      input.name,
      input.strength,
      input.dosageForm
    );
    if (existing) {
      throw new ConflictError(
        `Medicine "${input.name} ${input.strength} (${input.dosageForm})" already exists.`
      );
    }

    const created = await medicineRepository.create(input);
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
    const existing = await medicineRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Medicine not found");
    }

    if (input.name || input.strength || input.dosageForm) {
      const name = input.name ?? existing.name;
      const strength = input.strength ?? existing.strength;
      const dosageForm = input.dosageForm ?? existing.dosageForm;
      const duplicate = await medicineRepository.findByName(name, strength, dosageForm);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError("Another medicine with this name, strength, and dosage form already exists.");
      }
    }

    const updated = await medicineRepository.update(id, input);
    await this.logAudit(user.id, "UPDATE_MEDICINE", updated.id, { changes: input });

    const stockStatus = calculateStockStatus(updated.batches, updated.reorderLevel);
    const totalStock = updated.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
    return { ...updated, stockStatus, totalStock };
  }

  async stockIn(
    user: { id: string },
    medicineId: string,
    input: StockInInput
  ) {
    const med = await medicineRepository.findById(medicineId);
    if (!med) throw new NotFoundError("Medicine not found");
    if (med.isArchived) throw new ConflictError("Cannot add stock to an archived medicine.");

    const expiryDate = new Date(input.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate <= today) {
      throw new ValidationError("Cannot stock in expired batch. Expiry date must be in the future.");
    }

    return prisma.$transaction(async (tx) => {
      const existingBatch = await medicineRepository.findBatchByNumber(medicineId, input.batchNo);
      let batchId: string;

      if (existingBatch) {
        const updated = await medicineRepository.incrementBatchQuantity(existingBatch.id, input.quantity, tx);
        batchId = updated.id;
      } else {
        const createdBatch = await medicineRepository.createBatch(
          { medicineId, batchNo: input.batchNo, expiryDate, quantity: input.quantity },
          tx
        );
        batchId = createdBatch.id;
      }

      const movement = await medicineRepository.createMovement(
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

  async stockOut(
    user: { id: string },
    medicineId: string,
    input: StockOutInput
  ) {
    const med = await medicineRepository.findById(medicineId);
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

  async adjustment(
    user: { id: string },
    medicineId: string,
    input: AdjustmentInput
  ) {
    const med = await medicineRepository.findById(medicineId);
    if (!med) throw new NotFoundError("Medicine not found");
    if (med.isArchived) throw new ConflictError("Cannot adjust an archived medicine.");
    if (!input.reason?.trim()) throw new ValidationError("Reason is required for inventory adjustments.");

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
    tx?: Prisma.TransactionClient;
  }) {
    const runTx = async (tx: Prisma.TransactionClient) => {
      const med = await tx.medicine.findUnique({
        where: { id: params.medicineId },
        include: { batches: true },
      });

      if (!med) throw new NotFoundError("Medicine not found");
      if (med.isArchived) throw new ConflictError("Archived medicines cannot be prescribed or dispensed.");

      const movementType: StockMovementType = params.type || "STOCK_OUT";

      if (params.batchId) {
        const batch = med.batches.find((b) => b.id === params.batchId);
        if (!batch) throw new NotFoundError("Selected batch not found");
        if (batch.quantity < params.quantity) {
          throw new ConflictError(
            `Insufficient stock in batch ${batch.batchNo}. Available: ${batch.quantity}, Requested: ${params.quantity}`
          );
        }
        await medicineRepository.updateBatchQuantity(batch.id, batch.quantity - params.quantity, tx);
        return [
          await medicineRepository.createMovement(
            {
              medicineId: params.medicineId,
              batchId: batch.id,
              type: movementType,
              quantity: params.quantity,
              reason: params.reason ?? (params.prescriptionId ? "Prescription Dispensed" : null),
              performedById: params.performedById,
              prescriptionId: params.prescriptionId ?? null,
            },
            tx
          ),
        ];
      }

      const activeBatches = med.batches.filter((b) => b.quantity > 0);
      const deductions = calculateFefoDeductions(activeBatches, params.quantity);
      const movements = [];

      for (const item of deductions) {
        const batch = activeBatches.find((b) => b.id === item.batchId)!;
        await medicineRepository.updateBatchQuantity(item.batchId, batch.quantity - item.quantity, tx);

        const movement = await medicineRepository.createMovement(
          {
            medicineId: params.medicineId,
            batchId: item.batchId,
            type: movementType,
            quantity: item.quantity,
            reason: params.reason ?? (params.prescriptionId ? "Prescription Dispensed" : null),
            performedById: params.performedById,
            prescriptionId: params.prescriptionId ?? null,
          },
          tx
        );
        movements.push(movement);
      }

      return movements;
    };

    return params.tx ? runTx(params.tx) : prisma.$transaction(runTx);
  }

  async getAlerts(): Promise<AlertsDTO> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringDateLimit = new Date(today);
    expiringDateLimit.setDate(expiringDateLimit.getDate() + MEDICINE_CONFIG.EXPIRING_SOON_DAYS);

    const [allMedicines, expiringSoon, expired] = await Promise.all([
      medicineRepository.findAll({ isArchived: false }),
      medicineRepository.findExpiringBatches(today, expiringDateLimit),
      medicineRepository.findExpiredBatches(today),
    ]);

    const lowStock: MedicineWithStock[] = allMedicines
      .map((med) => {
        const stockStatus = calculateStockStatus(med.batches, med.reorderLevel);
        const totalStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
        return { ...med, stockStatus, totalStock };
      })
      .filter((med) => med.stockStatus === STOCK_STATUS.LOW_STOCK || med.stockStatus === STOCK_STATUS.OUT_OF_STOCK);

    return {
      lowStock,
      expiringSoon,
      expired,
    };
  }

  async listMovements(
    params: ListMovementsInput
  ) {
    const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);
    const [items, total] = await Promise.all([
      medicineRepository.listMovements({ medicineId: params.medicineId, skip, take }),
      medicineRepository.countMovements({ medicineId: params.medicineId }),
    ]);

    return buildPaginatedResponse(items, total, params.page, params.pageSize);
  }

  private async logAudit(actorId: string, action: string, entityId: string, metadata: unknown) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId,
          action,
          entity: "Medicine",
          entityId,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });
    } catch (e) {
      console.warn("Audit log creation failed:", e);
    }
  }
}

export const medicineService = new MedicineService();
