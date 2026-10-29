import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import { dbClient } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import type { Prisma } from "@prisma/client";
import type {
  MedicineBatchWithMedicine,
  StockMovementWithRelations,
} from "@backend/modules/medicines/application/dto/medicine.types";
import type {
  MedicineChanges,
  MedicineQuery,
  MedicineRepositoryPort,
  NewMedicine,
  NewStockMovement,
} from "@backend/modules/medicines/application/ports/outbound/medicine-repository.port";

const MOVEMENT_INCLUDE = {
  medicine: { select: { id: true, name: true, strength: true, dosageForm: true } },
  batch: { select: { id: true, batchNo: true, expiryDate: true } },
  performedBy: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.StockMovementInclude;

function buildMedicineWhere({
  search,
  isArchived,
}: Omit<MedicineQuery, "skip" | "take">): Prisma.MedicineWhereInput {
  return {
    ...(isArchived !== undefined ? { isArchived } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { genericName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const medicineRepository = {
  async findAll({ skip, take, ...filter }: MedicineQuery) {
    return prisma.medicine.findMany({
      where: buildMedicineWhere(filter),
      skip,
      take,
      include: { batches: true },
      orderBy: { name: "asc" },
    });
  },

  async countAll(filter: Omit<MedicineQuery, "skip" | "take">) {
    return prisma.medicine.count({ where: buildMedicineWhere(filter) });
  },

  async findById(id, tx) {
    return dbClient(tx).medicine.findUnique({
      where: { id },
      include: { batches: { orderBy: { expiryDate: "asc" } } },
    });
  },

  async findByName(name: string, strength: string, dosageForm: string) {
    return prisma.medicine.findUnique({
      where: { name_strength_dosageForm: { name, strength, dosageForm } },
    });
  },

  async create(data: NewMedicine) {
    return prisma.medicine.create({ data, include: { batches: true } });
  },

  async update(id: string, data: MedicineChanges) {
    return prisma.medicine.update({ where: { id }, data, include: { batches: true } });
  },

  async addStockToBatch({ medicineId, batchNo, expiryDate, quantity }, tx) {
    // Single INSERT … ON CONFLICT: concurrent stock-ins of the same batch cannot create duplicates.
    return dbClient(tx).medicineBatch.upsert({
      where: { medicineId_batchNo: { medicineId, batchNo } },
      create: { medicineId, batchNo, expiryDate, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  async deductFromBatch(batchId, quantity, tx) {
    // Conditional decrement in one statement: never goes negative, never loses a concurrent update.
    const { count } = await dbClient(tx).medicineBatch.updateMany({
      where: { id: batchId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    return count === 1;
  },

  async createMovement(data: NewStockMovement, tx) {
    return dbClient(tx).stockMovement.create({ data, include: MOVEMENT_INCLUDE });
  },

  async listMovements(params: {
    medicineId?: string;
    skip?: number;
    take?: number;
  }): Promise<StockMovementWithRelations[]> {
    return prisma.stockMovement.findMany({
      where: params.medicineId ? { medicineId: params.medicineId } : {},
      skip: params.skip,
      take: params.take,
      include: MOVEMENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  async countMovements(params: { medicineId?: string }) {
    return prisma.stockMovement.count({
      where: params.medicineId ? { medicineId: params.medicineId } : {},
    });
  },

  async findExpiringBatches(startDate: Date, endDate: Date): Promise<MedicineBatchWithMedicine[]> {
    return prisma.medicineBatch.findMany({
      where: { quantity: { gt: 0 }, expiryDate: { gt: startDate, lte: endDate } },
      include: { medicine: true },
      orderBy: { expiryDate: "asc" },
    });
  },

  async findExpiredBatches(cutoffDate: Date): Promise<MedicineBatchWithMedicine[]> {
    return prisma.medicineBatch.findMany({
      where: { quantity: { gt: 0 }, expiryDate: { lte: cutoffDate } },
      include: { medicine: true },
      orderBy: { expiryDate: "asc" },
    });
  },
} satisfies MedicineRepositoryPort;
