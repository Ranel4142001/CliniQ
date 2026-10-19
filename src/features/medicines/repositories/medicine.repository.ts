import { prisma } from "@/shared/lib/prisma";
import type { Prisma, StockMovementType } from "@prisma/client";
import type {
  MedicineBatchWithMedicine,
  StockMovementWithRelations,
} from "../types/medicine.types";

export const medicineRepository = {
  async findAll(params: {
    search?: string;
    isArchived?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.MedicineWhereInput = {
      ...(params.isArchived !== undefined ? { isArchived: params.isArchived } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { genericName: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return prisma.medicine.findMany({
      where,
      skip: params.skip,
      take: params.take,
      include: { batches: true },
      orderBy: { name: "asc" },
    });
  },

  async countAll(params: { search?: string; isArchived?: boolean }) {
    const where: Prisma.MedicineWhereInput = {
      ...(params.isArchived !== undefined ? { isArchived: params.isArchived } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { genericName: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return prisma.medicine.count({ where });
  },

  async findById(id: string) {
    return prisma.medicine.findUnique({
      where: { id },
      include: { batches: { orderBy: { expiryDate: "asc" } } },
    });
  },

  async findByName(name: string, strength: string, dosageForm: string) {
    return prisma.medicine.findUnique({
      where: {
        name_strength_dosageForm: {
          name,
          strength,
          dosageForm,
        },
      },
    });
  },

  async create(data: {
    name: string;
    genericName?: string | null;
    dosageForm: string;
    strength: string;
    unit: string;
    reorderLevel?: number;
  }) {
    return prisma.medicine.create({
      data: {
        name: data.name,
        genericName: data.genericName,
        dosageForm: data.dosageForm,
        strength: data.strength,
        unit: data.unit,
        reorderLevel: data.reorderLevel,
      },
      include: { batches: true },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      genericName?: string | null;
      dosageForm?: string;
      strength?: string;
      unit?: string;
      reorderLevel?: number;
      isArchived?: boolean;
    }
  ) {
    return prisma.medicine.update({
      where: { id },
      data,
      include: { batches: true },
    });
  },

  async findBatchByNumber(medicineId: string, batchNo: string) {
    return prisma.medicineBatch.findUnique({
      where: {
        medicineId_batchNo: {
          medicineId,
          batchNo,
        },
      },
    });
  },

  async findBatchById(id: string) {
    return prisma.medicineBatch.findUnique({
      where: { id },
      include: { medicine: true },
    });
  },

  async findActiveBatchesByMedicineId(medicineId: string) {
    return prisma.medicineBatch.findMany({
      where: {
        medicineId,
        quantity: { gt: 0 },
      },
      orderBy: { expiryDate: "asc" },
    });
  },

  async createBatch(
    data: {
      medicineId: string;
      batchNo: string;
      expiryDate: Date;
      quantity: number;
    },
    client: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    return client.medicineBatch.create({
      data: {
        medicineId: data.medicineId,
        batchNo: data.batchNo,
        expiryDate: data.expiryDate,
        quantity: data.quantity,
      },
    });
  },

  async incrementBatchQuantity(
    id: string,
    quantity: number,
    client: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    return client.medicineBatch.update({
      where: { id },
      data: { quantity: { increment: quantity } },
    });
  },

  async updateBatchQuantity(
    id: string,
    quantity: number,
    client: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    return client.medicineBatch.update({
      where: { id },
      data: { quantity },
    });
  },

  async createMovement(
    data: {
      medicineId: string;
      batchId: string;
      type: StockMovementType;
      quantity: number;
      reason?: string | null;
      performedById: string;
      prescriptionId?: string | null;
    },
    client: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    return client.stockMovement.create({
      data,
      include: {
        medicine: { select: { id: true, name: true, strength: true, dosageForm: true } },
        batch: { select: { id: true, batchNo: true, expiryDate: true } },
        performedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
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
      include: {
        medicine: { select: { id: true, name: true, strength: true, dosageForm: true } },
        batch: { select: { id: true, batchNo: true, expiryDate: true } },
        performedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<StockMovementWithRelations[]>;
  },

  async countMovements(params: { medicineId?: string }) {
    return prisma.stockMovement.count({
      where: params.medicineId ? { medicineId: params.medicineId } : {},
    });
  },

  async findExpiringBatches(startDate: Date, endDate: Date): Promise<MedicineBatchWithMedicine[]> {
    return prisma.medicineBatch.findMany({
      where: {
        quantity: { gt: 0 },
        expiryDate: {
          gt: startDate,
          lte: endDate,
        },
      },
      include: { medicine: true },
      orderBy: { expiryDate: "asc" },
    }) as Promise<MedicineBatchWithMedicine[]>;
  },

  async findExpiredBatches(cutoffDate: Date): Promise<MedicineBatchWithMedicine[]> {
    return prisma.medicineBatch.findMany({
      where: {
        quantity: { gt: 0 },
        expiryDate: { lte: cutoffDate },
      },
      include: { medicine: true },
      orderBy: { expiryDate: "asc" },
    }) as Promise<MedicineBatchWithMedicine[]>;
  },
};
