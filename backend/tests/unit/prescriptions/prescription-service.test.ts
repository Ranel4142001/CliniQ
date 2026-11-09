import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrescriptionService } from "@backend/modules/prescriptions/application/services/prescription.service";
import type { PrescriptionRepositoryPort } from "@backend/modules/prescriptions/application/ports/outbound/prescription-repository.port";
import {
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@backend/shared/domain/errors/app-error";
import { fakeAuditLog, fakeRecordNumbers, fakeTransactions } from "../../support/fakes";

const notImplemented = () => Promise.reject(new Error("not stubbed in this test"));

const prescriptionRepository: PrescriptionRepositoryPort = {
  findById: notImplemented,
  findByConsultationId: notImplemented,
  findAll: notImplemented,
  countAll: notImplemented,
  create: notImplemented,
  updateDraft: notImplemented,
  transition: notImplemented,
  countByStatus: notImplemented,
  findConsultation: notImplemented,
  findArchivedMedicines: async () => [],
  isPrescriptionNoTaken: async () => false,
  countPrescriptionNosStartingWith: async () => 0,
};

const stock = { dispense: vi.fn().mockResolvedValue([]) };

describe("PrescriptionService Business Rules", () => {
  let service: PrescriptionService;

  beforeEach(() => {
    vi.restoreAllMocks();
    stock.dispense.mockClear();
    service = new PrescriptionService({
      prescriptionRepository,
      stock,
      transactions: fakeTransactions(),
      recordNumbers: fakeRecordNumbers("RX-261110-291"),
      auditLog: fakeAuditLog(),
    });
  });

  const mockConsultation = {
    id: "consult-1",
    appointmentId: "appt-1",
    patientId: "patient-1",
    clinicianId: "doc-1",
    chiefComplaint: "Fever and cough",
  };

  const mockPrescription = {
    id: "rx-1",
    prescriptionNo: "RX-261110-291",
    consultationId: "consult-1",
    patientId: "patient-1",
    clinicianId: "doc-1",
    status: "DRAFT" as const,
    notes: "Take plenty of water",
    voidReason: null,
    issuedAt: null,
    dispensedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: "patient-1", firstName: "Juan", lastName: "Dela Cruz" },
    clinician: { id: "doc-1", fullName: "Dr. Smith", email: "dr@cliniq.local" },
    consultation: mockConsultation,
    items: [
      {
        id: "item-1",
        prescriptionId: "rx-1",
        medicineId: "med-1",
        dosage: "500mg",
        frequency: "Three times daily",
        durationDays: 7,
        quantity: 21,
        instructions: "After meals",
        medicine: {
          id: "med-1",
          name: "Amoxicillin",
          strength: "500mg",
          dosageForm: "Capsule",
          isArchived: false,
        },
      },
    ],
  };

  it("prevents non-assigned clinician from creating a prescription for consultation", async () => {
    vi.spyOn(prescriptionRepository, "findConsultation").mockResolvedValue(mockConsultation);

    await expect(
      service.createPrescription(
        { id: "other-doc", role: "CLINICIAN" },
        {
          consultationId: "consult-1",
          items: [
            {
              medicineId: "med-1",
              dosage: "500mg",
              frequency: "Daily",
              durationDays: 7,
              quantity: 7,
            },
          ],
        }
      )
    ).rejects.toThrow(ForbiddenError);
  });

  it("prevents creating duplicate prescription for the same consultation", async () => {
    vi.spyOn(prescriptionRepository, "findConsultation").mockResolvedValue(mockConsultation);
    vi.spyOn(prescriptionRepository, "findByConsultationId").mockResolvedValue(
      mockPrescription as any
    );

    await expect(
      service.createPrescription(
        { id: "doc-1", role: "CLINICIAN" },
        {
          consultationId: "consult-1",
          items: [
            {
              medicineId: "med-1",
              dosage: "500mg",
              frequency: "Daily",
              durationDays: 7,
              quantity: 7,
            },
          ],
        }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("prevents prescribing archived medicines", async () => {
    vi.spyOn(prescriptionRepository, "findConsultation").mockResolvedValue(mockConsultation);
    vi.spyOn(prescriptionRepository, "findByConsultationId").mockResolvedValue(null);
    vi.spyOn(prescriptionRepository, "findArchivedMedicines").mockResolvedValue([
      { name: "ArchivedDrug", strength: "10mg" },
    ]);

    await expect(
      service.createPrescription(
        { id: "doc-1", role: "CLINICIAN" },
        {
          consultationId: "consult-1",
          items: [
            {
              medicineId: "med-1",
              dosage: "10mg",
              frequency: "Daily",
              durationDays: 5,
              quantity: 5,
            },
          ],
        }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("locks editing once a prescription is ISSUED", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue({
      ...mockPrescription,
      status: "ISSUED",
    } as any);

    await expect(
      service.updatePrescription({ id: "doc-1", role: "CLINICIAN" }, "rx-1", {
        notes: "New updated notes",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("issues prescription and assigns a date-based record number", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue(mockPrescription as any);
    const transitionSpy = vi.spyOn(prescriptionRepository, "transition").mockResolvedValue({
      ...mockPrescription,
      status: "ISSUED",
      prescriptionNo: "RX-261110-291",
      issuedAt: new Date(),
    } as any);

    const issued = await service.issuePrescription({ id: "doc-1", role: "CLINICIAN" }, "rx-1");
    expect(transitionSpy).toHaveBeenCalledWith(
      "rx-1",
      ["DRAFT"],
      "ISSUED",
      expect.objectContaining({ prescriptionNo: "RX-261110-291" }),
      expect.anything()
    );
    expect(issued.status).toBe("ISSUED");
  });

  it("dispenses prescription and invokes dispenseMedicine for each item", async () => {
    vi.spyOn(prescriptionRepository, "findById")
      .mockResolvedValueOnce({ ...mockPrescription, status: "ISSUED" } as any)
      .mockResolvedValueOnce({
        ...mockPrescription,
        status: "DISPENSED",
        dispensedAt: new Date(),
      } as any);
    const transitionSpy = vi.spyOn(prescriptionRepository, "transition").mockResolvedValue({
      ...mockPrescription,
      status: "DISPENSED",
    } as any);

    const result = await service.dispensePrescription({ id: "staff-1", role: "STAFF" }, "rx-1");
    expect(stock.dispense).toHaveBeenCalledTimes(1);
    expect(stock.dispense).toHaveBeenCalledWith(
      expect.objectContaining({
        medicineId: "med-1",
        quantity: 21,
        performedById: "staff-1",
        prescriptionId: "rx-1",
      })
    );
    expect(transitionSpy).toHaveBeenCalledWith(
      "rx-1",
      ["ISSUED"],
      "DISPENSED",
      expect.anything(),
      expect.anything()
    );
    expect(result.status).toBe("DISPENSED");
  });

  it("dispenses only once when two requests race: the loser moves no stock", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue({
      ...mockPrescription,
      status: "ISSUED",
    } as any);
    // The other request already moved the prescription out of ISSUED.
    vi.spyOn(prescriptionRepository, "transition").mockResolvedValue(null);

    await expect(
      service.dispensePrescription({ id: "staff-1", role: "STAFF" }, "rx-1")
    ).rejects.toThrow(ConflictError);
    expect(stock.dispense).not.toHaveBeenCalled();
  });

  it("rejects voiding an already dispensed prescription", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue({
      ...mockPrescription,
      status: "DISPENSED",
    } as any);

    await expect(
      service.voidPrescription({ id: "doc-1", role: "CLINICIAN" }, "rx-1", {
        voidReason: "Patient changed mind",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("requires a non-empty reason when voiding a prescription", async () => {
    await expect(
      service.voidPrescription({ id: "doc-1", role: "CLINICIAN" }, "rx-1", { voidReason: "   " })
    ).rejects.toThrow(ValidationError);
  });
});
