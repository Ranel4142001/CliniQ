import { describe, it, expect, vi, beforeEach } from "vitest";
import { MedicineService } from "@/features/medicines/services/medicine.service";
import { medicineRepository } from "@/features/medicines/repositories/medicine.repository";
import { prisma } from "@/shared/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/lib/errors";

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
    medicine: {
      findUnique: vi.fn(),
    },
    medicineBatch: {
      update: vi.fn(),
      create: vi.fn(),
    },
    stockMovement: {
      create: vi.fn(),
    },
  },
}));

describe("MedicineService Business Rules", () => {
  let service: MedicineService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MedicineService();
  });

  const mockMedicine = {
    id: "med-1",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    dosageForm: "Tablet",
    strength: "500mg",
    unit: "mg",
    reorderLevel: 20,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    batches: [
      {
        id: "batch-1",
        medicineId: "med-1",
        batchNo: "BATCH001",
        expiryDate: new Date("2026-12-01"),
        quantity: 50,
        createdAt: new Date(),
      },
    ],
  };

  it("prevents duplicate medicine with identical name, strength, and dosageForm", async () => {
    vi.spyOn(medicineRepository, "findByName").mockResolvedValue(mockMedicine as any);

    await expect(
      service.createMedicine(
        { id: "user-1" },
        {
          name: "Paracetamol",
          dosageForm: "Tablet",
          strength: "500mg",
          unit: "mg",
          reorderLevel: 10,
        }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("throws ValidationError when attempting to stock in an already expired batch", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue(mockMedicine as any);

    await expect(
      service.stockIn(
        { id: "user-1" },
        "med-1",
        {
          batchNo: "EXPIRED01",
          quantity: 10,
          expiryDate: "2020-01-01",
        }
      )
    ).rejects.toThrow(ValidationError);
  });

  it("prevents stock operations on archived medicines", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue({
      ...mockMedicine,
      isArchived: true,
    } as any);

    await expect(
      service.stockIn(
        { id: "user-1" },
        "med-1",
        {
          batchNo: "BATCH99",
          quantity: 10,
          expiryDate: "2027-01-01",
        }
      )
    ).rejects.toThrow(ConflictError);

    await expect(
      service.stockOut(
        { id: "user-1" },
        "med-1",
        {
          quantity: 5,
        }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("deducts stock via FEFO when dispensing medicine", async () => {
    const medWithMultipleBatches = {
      ...mockMedicine,
      batches: [
        {
          id: "batch-soon",
          medicineId: "med-1",
          batchNo: "B-SOON",
          expiryDate: new Date("2026-11-01"),
          quantity: 10,
        },
        {
          id: "batch-later",
          medicineId: "med-1",
          batchNo: "B-LATER",
          expiryDate: new Date("2027-01-01"),
          quantity: 30,
        },
      ],
    };

    vi.spyOn(prisma.medicine, "findUnique").mockResolvedValue(medWithMultipleBatches as any);
    const updateBatchSpy = vi.spyOn(medicineRepository, "updateBatchQuantity").mockResolvedValue({} as any);
    const createMovementSpy = vi.spyOn(medicineRepository, "createMovement").mockResolvedValue({} as any);

    // Requesting 15 items: should take all 10 from batch-soon and 5 from batch-later
    await service.dispenseMedicine({
      medicineId: "med-1",
      quantity: 15,
      performedById: "user-1",
      reason: "Patient prescription",
    });

    expect(updateBatchSpy).toHaveBeenCalledTimes(2);
    // batch-soon becomes 0 (10 - 10)
    expect(updateBatchSpy).toHaveBeenNthCalledWith(1, "batch-soon", 0, expect.anything());
    // batch-later becomes 25 (30 - 5)
    expect(updateBatchSpy).toHaveBeenNthCalledWith(2, "batch-later", 25, expect.anything());

    expect(createMovementSpy).toHaveBeenCalledTimes(2);
  });

  it("throws ConflictError when attempting to dispense more than available stock", async () => {
    vi.spyOn(prisma.medicine, "findUnique").mockResolvedValue(mockMedicine as any);

    await expect(
      service.dispenseMedicine({
        medicineId: "med-1",
        quantity: 999, // only 50 available
        performedById: "user-1",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("requires a reason for adjustment movements", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue(mockMedicine as any);

    await expect(
      service.adjustment(
        { id: "user-1" },
        "med-1",
        {
          quantity: 5,
          reason: "",
        }
      )
    ).rejects.toThrow(ValidationError);
  });
});
