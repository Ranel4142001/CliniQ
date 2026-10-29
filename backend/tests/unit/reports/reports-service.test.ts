import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportsService } from "@backend/modules/reports/application/services/reports.service";
import type { ReportsQueryPort } from "@backend/modules/reports/application/ports/outbound/reports-query.port";
import { ValidationError } from "@backend/shared/domain/errors/app-error";

const notImplemented = () => Promise.reject(new Error("not stubbed in this test"));

const reportsRepository: ReportsQueryPort = {
  getAppointments: notImplemented,
  getConsultations: notImplemented,
  getInventory: notImplemented,
  getMovements: notImplemented,
  getPrescriptions: notImplemented,
};

describe("ReportsService", () => {
  let service: ReportsService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    service = new ReportsService({ reportsRepository });
  });

  it("generates appointments report with date filtering and mapped patient/clinician names", async () => {
    vi.spyOn(reportsRepository, "getAppointments").mockResolvedValue([
      {
        id: "appt-1",
        scheduledAt: new Date("2026-10-21T09:00:00Z"),
        type: "IN_PERSON",
        status: "CONFIRMED",
        reason: "General Consultation",
        patient: { id: "p-1", patientNo: "PT-2026-0001", firstName: "Maria", lastName: "Santos" },
        clinician: { id: "doc-1", fullName: "Dr. Cruz", email: "dr@cliniq.local" },
      } as any,
    ]);

    const result = await service.generateReport("appointments", {
      from: "2026-10-01",
      to: "2026-10-31",
      status: "CONFIRMED",
    });

    expect(result).toHaveLength(1);
    expect(result[0].patientName).toBe("Maria Santos");
    expect(result[0].clinicianName).toBe("Dr. Cruz");
    expect(result[0].patientNo).toBe("PT-2026-0001");
    expect(result[0].status).toBe("CONFIRMED");
  });

  it("generates consultations report for completed patient visits", async () => {
    vi.spyOn(reportsRepository, "getConsultations").mockResolvedValue([
      {
        id: "cons-1",
        startedAt: new Date("2026-10-21T10:00:00Z"),
        endedAt: new Date("2026-10-21T10:30:00Z"),
        chiefComplaint: "Severe headache",
        diagnosis: "Tension headache",
        patient: { id: "p-1", patientNo: "PT-2026-0001", firstName: "Maria", lastName: "Santos" },
        clinician: { id: "doc-1", fullName: "Dr. Cruz", email: "dr@cliniq.local" },
      } as any,
    ]);

    const result = await service.generateReport("consultations", {});

    expect(result).toHaveLength(1);
    expect(result[0].chiefComplaint).toBe("Severe headache");
    expect(result[0].diagnosis).toBe("Tension headache");
    expect(result[0].patientName).toBe("Maria Santos");
  });

  it("generates inventory report computing stock status and total quantities", async () => {
    vi.spyOn(reportsRepository, "getInventory").mockResolvedValue([
      {
        id: "med-1",
        name: "Paracetamol",
        genericName: "Acetaminophen",
        dosageForm: "Tablet",
        strength: "500mg",
        unit: "tablet",
        reorderLevel: 50,
        batches: [
          { quantity: 20, expiryDate: new Date("2026-12-01") },
          { quantity: 10, expiryDate: new Date("2027-01-01") },
        ],
      } as any,
    ]);

    const result = await service.generateReport("inventory", {});

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Paracetamol");
    expect(result[0].totalStock).toBe(30);
    // 30 <= 50 reorderLevel -> LOW_STOCK
    expect(result[0].stockStatus).toBe("LOW_STOCK");
  });

  it("generates movements report with audit metadata", async () => {
    vi.spyOn(reportsRepository, "getMovements").mockResolvedValue([
      {
        id: "mov-1",
        createdAt: new Date("2026-10-20T14:00:00Z"),
        type: "STOCK_IN",
        quantity: 100,
        reason: "Stock In Initial Batch",
        medicine: { id: "med-1", name: "Paracetamol", strength: "500mg", dosageForm: "Tablet" },
        batch: { id: "b-1", batchNo: "BATCH-001" },
        performedBy: { id: "staff-1", fullName: "Clinic Staff", email: "staff@cliniq.local" },
      } as any,
    ]);

    const result = await service.generateReport("movements", {});

    expect(result).toHaveLength(1);
    expect(result[0].medicineName).toBe("Paracetamol 500mg");
    expect(result[0].batchNo).toBe("BATCH-001");
    expect(result[0].type).toBe("STOCK_IN");
    expect(result[0].quantity).toBe(100);
  });

  it("generates prescriptions report with items count and status", async () => {
    vi.spyOn(reportsRepository, "getPrescriptions").mockResolvedValue([
      {
        id: "rx-1",
        prescriptionNo: "RX-2026-0001",
        issuedAt: new Date("2026-10-20T11:00:00Z"),
        dispensedAt: new Date("2026-10-20T11:30:00Z"),
        status: "DISPENSED",
        patient: { id: "p-1", patientNo: "PT-2026-0001", firstName: "Maria", lastName: "Santos" },
        clinician: { id: "doc-1", fullName: "Dr. Cruz", email: "dr@cliniq.local" },
        items: [{ id: "item-1" }, { id: "item-2" }],
      } as any,
    ]);

    const result = await service.generateReport("prescriptions", {});

    expect(result).toHaveLength(1);
    expect(result[0].prescriptionNo).toBe("RX-2026-0001");
    expect(result[0].itemsCount).toBe(2);
    expect(result[0].status).toBe("DISPENSED");
  });

  it("throws ValidationError for unknown report key", async () => {
    await expect(service.generateReport("unknown-key" as any, {})).rejects.toThrow(ValidationError);
  });
});
