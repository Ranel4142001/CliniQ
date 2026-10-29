import { describe, it, expect, vi, beforeEach } from "vitest";
import { MedicineService } from "@backend/modules/medicines/application/services/medicine.service";
import type { MedicineRepositoryPort } from "@backend/modules/medicines/application/ports/outbound/medicine-repository.port";
import { ConflictError, ValidationError } from "@backend/shared/domain/errors/app-error";
import { fakeAuditLog, fakeTransactions } from "../../support/fakes";

const notImplemented = () => Promise.reject(new Error("not stubbed in this test"));

const medicineRepository: MedicineRepositoryPort = {
  findAll: notImplemented,
  countAll: notImplemented,
  findById: notImplemented,
  findByName: notImplemented,
  create: notImplemented,
  update: notImplemented,
  addStockToBatch: notImplemented,
  deductFromBatch: notImplemented,
  createMovement: notImplemented,
  listMovements: notImplemented,
  countMovements: notImplemented,
  findExpiringBatches: notImplemented,
  findExpiredBatches: notImplemented,
};

describe("MedicineService Business Rules", () => {
  let service: MedicineService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new MedicineService({
      medicineRepository,
      transactions: fakeTransactions(),
      auditLog: fakeAuditLog(),
    });
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
      service.stockIn({ id: "user-1" }, "med-1", {
        batchNo: "EXPIRED01",
        quantity: 10,
        expiryDate: "2020-01-01",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("prevents stock operations on archived medicines", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue({
      ...mockMedicine,
      isArchived: true,
    } as any);

    await expect(
      service.stockIn({ id: "user-1" }, "med-1", {
        batchNo: "BATCH99",
        quantity: 10,
        expiryDate: "2027-01-01",
      })
    ).rejects.toThrow(ConflictError);

    await expect(
      service.stockOut({ id: "user-1" }, "med-1", {
        quantity: 5,
      })
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

    vi.spyOn(medicineRepository, "findById").mockResolvedValue(medWithMultipleBatches as any);
    const deductSpy = vi.spyOn(medicineRepository, "deductFromBatch").mockResolvedValue(true);
    const createMovementSpy = vi
      .spyOn(medicineRepository, "createMovement")
      .mockResolvedValue({} as any);

    // Requesting 15 items: should take all 10 from batch-soon and 5 from batch-later
    await service.dispenseMedicine({
      medicineId: "med-1",
      quantity: 15,
      performedById: "user-1",
      reason: "Patient prescription",
    });

    expect(deductSpy).toHaveBeenCalledTimes(2);
    // all 10 from the soonest-expiring batch, then 5 from the next one
    expect(deductSpy).toHaveBeenNthCalledWith(1, "batch-soon", 10, expect.anything());
    expect(deductSpy).toHaveBeenNthCalledWith(2, "batch-later", 5, expect.anything());

    expect(createMovementSpy).toHaveBeenCalledTimes(2);
  });

  it("throws ConflictError when attempting to dispense more than available stock", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue(mockMedicine as any);

    await expect(
      service.dispenseMedicine({
        medicineId: "med-1",
        quantity: 999, // only 50 available
        performedById: "user-1",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("aborts instead of overselling when stock is consumed concurrently", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue(mockMedicine as any);
    // The batch looked sufficient when read, but another transaction took the stock first.
    vi.spyOn(medicineRepository, "deductFromBatch").mockResolvedValue(false);
    const createMovementSpy = vi.spyOn(medicineRepository, "createMovement");

    await expect(
      service.dispenseMedicine({ medicineId: "med-1", quantity: 5, performedById: "user-1" })
    ).rejects.toThrow(ConflictError);
    expect(createMovementSpy).not.toHaveBeenCalled();
  });

  it("requires a reason for adjustment movements", async () => {
    vi.spyOn(medicineRepository, "findById").mockResolvedValue(mockMedicine as any);

    await expect(
      service.adjustment({ id: "user-1" }, "med-1", {
        quantity: 5,
        reason: "",
      })
    ).rejects.toThrow(ValidationError);
  });
});
