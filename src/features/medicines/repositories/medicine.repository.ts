import { prisma } from "@/shared/lib/prisma";
import type { Prisma, StockMovementType, Medicine, MedicineBatch } from "@prisma/client";
import type {
  MedicineBatchWithMedicine,
  StockMovementWithRelations,
} from "../types/medicine.types";
import { demoStore } from "@/shared/lib/demo-data";

type MedicineWithBatches = Medicine & { batches: MedicineBatch[] };

export const medicineRepository = {
  async findAll(params: {
    search?: string;
    isArchived?: boolean;
    skip?: number;
    take?: number;
  }): Promise<MedicineWithBatches[]> {
    try {
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

      return (await prisma.medicine.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: { batches: true },
        orderBy: { name: "asc" },
      })) as MedicineWithBatches[];
    } catch {
      let list = demoStore.medicines.filter((m) =>
        params.isArchived !== undefined ? m.isArchived === params.isArchived : !m.isArchived
      );
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(q) || m.genericName?.toLowerCase().includes(q));
      }
      const skip = params.skip || 0;
      const take = params.take || 10;
      return list.slice(skip, skip + take) as MedicineWithBatches[];
    }
  },

  async countAll(params: { search?: string; isArchived?: boolean }) {
    try {
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
      return await prisma.medicine.count({ where });
    } catch {
      let list = demoStore.medicines.filter((m) =>
        params.isArchived !== undefined ? m.isArchived === params.isArchived : !m.isArchived
      );
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(q) || m.genericName?.toLowerCase().includes(q));
      }
      return list.length;
    }
  },

  async findById(id: string): Promise<MedicineWithBatches | null> {
    try {
      return (await prisma.medicine.findUnique({
        where: { id },
        include: { batches: { orderBy: { expiryDate: "asc" } } },
      })) as MedicineWithBatches | null;
    } catch {
      return (demoStore.medicines.find((item) => item.id === id) || demoStore.medicines[0]) as MedicineWithBatches;
    }
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
    try {
      return (await prisma.stockMovement.findMany({
        where: params.medicineId ? { medicineId: params.medicineId } : {},
        skip: params.skip,
        take: params.take,
        include: {
          medicine: { select: { id: true, name: true, strength: true, dosageForm: true } },
          batch: { select: { id: true, batchNo: true, expiryDate: true } },
          performedBy: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })) as StockMovementWithRelations[];
    } catch {
      return [
        {
          id: "demo-mov-1",
          medicineId: demoStore.medicines[0].id,
          batchId: demoStore.medicines[0].batches[0].id,
          type: "STOCK_IN",
          quantity: 500,
          reason: "Initial clinic stock intake",
          performedById: "demo-admin-id",
          prescriptionId: null,
          createdAt: new Date(),
          medicine: { id: demoStore.medicines[0].id, name: demoStore.medicines[0].name, strength: demoStore.medicines[0].strength, dosageForm: demoStore.medicines[0].dosageForm },
          batch: { id: demoStore.medicines[0].batches[0].id, batchNo: demoStore.medicines[0].batches[0].batchNo, expiryDate: demoStore.medicines[0].batches[0].expiryDate },
          performedBy: { id: "demo-admin-id", fullName: "System Administrator", email: "admin@cliniq.local" },
        },
      ];
    }
  },

  async countMovements(params: { medicineId?: string }) {
    try {
      return await prisma.stockMovement.count({
        where: params.medicineId ? { medicineId: params.medicineId } : {},
      });
    } catch {
      return 1;
    }
  },

  async findExpiringBatches(startDate: Date, endDate: Date): Promise<MedicineBatchWithMedicine[]> {
    try {
      return (await prisma.medicineBatch.findMany({
        where: {
          quantity: { gt: 0 },
          expiryDate: {
            gt: startDate,
            lte: endDate,
          },
        },
        include: { medicine: true },
        orderBy: { expiryDate: "asc" },
      })) as MedicineBatchWithMedicine[];
    } catch {
      const list: MedicineBatchWithMedicine[] = [];
      for (const m of demoStore.medicines) {
        for (const b of m.batches) {
          if (b.quantity > 0 && b.expiryDate > startDate && b.expiryDate <= endDate) {
            list.push({ ...b, medicine: m } as unknown as MedicineBatchWithMedicine);
          }
        }
      }
      return list;
    }
  },

  async findExpiredBatches(cutoffDate: Date): Promise<MedicineBatchWithMedicine[]> {
    try {
      return (await prisma.medicineBatch.findMany({
        where: {
          quantity: { gt: 0 },
          expiryDate: { lte: cutoffDate },
        },
        include: { medicine: true },
        orderBy: { expiryDate: "asc" },
      })) as MedicineBatchWithMedicine[];
    } catch {
      const list: MedicineBatchWithMedicine[] = [];
      for (const m of demoStore.medicines) {
        for (const b of m.batches) {
          if (b.quantity > 0 && b.expiryDate <= cutoffDate) {
            list.push({ ...b, medicine: m } as unknown as MedicineBatchWithMedicine);
          }
        }
      }
      return list;
    }
  },
};
