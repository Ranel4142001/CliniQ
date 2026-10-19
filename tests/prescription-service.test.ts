import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrescriptionService } from "@/features/prescriptions/services/prescription.service";
import { prescriptionRepository } from "@/features/prescriptions/repositories/prescription.repository";
import { prisma } from "@/shared/lib/prisma";
import * as medicinesModule from "@/features/medicines";
import { ForbiddenError, ConflictError, ValidationError } from "@/shared/lib/errors";

vi.mock("@/features/medicines", () => ({
  dispenseMedicine: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
    consultation: {
      findUnique: vi.fn(),
    },
    medicine: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    counter: {
      upsert: vi.fn().mockResolvedValue({ key: "RX-2026", value: 1 }),
    },
  },
}));

describe("PrescriptionService Business Rules", () => {
  let service: PrescriptionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PrescriptionService();
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
    prescriptionNo: "RX-2026-0001",
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
        medicine: { id: "med-1", name: "Amoxicillin", strength: "500mg", dosageForm: "Capsule", isArchived: false },
      },
    ],
  };

  it("prevents non-assigned clinician from creating a prescription for consultation", async () => {
    vi.spyOn(prisma.consultation, "findUnique").mockResolvedValue(mockConsultation as any);

    await expect(
      service.createPrescription(
        { id: "other-doc", role: "CLINICIAN" },
        {
          consultationId: "consult-1",
          items: [{ medicineId: "med-1", dosage: "500mg", frequency: "Daily", durationDays: 7, quantity: 7 }],
        }
      )
    ).rejects.toThrow(ForbiddenError);
  });

  it("prevents creating duplicate prescription for the same consultation", async () => {
    vi.spyOn(prisma.consultation, "findUnique").mockResolvedValue(mockConsultation as any);
    vi.spyOn(prescriptionRepository, "findByConsultationId").mockResolvedValue(mockPrescription as any);

    await expect(
      service.createPrescription(
        { id: "doc-1", role: "CLINICIAN" },
        {
          consultationId: "consult-1",
          items: [{ medicineId: "med-1", dosage: "500mg", frequency: "Daily", durationDays: 7, quantity: 7 }],
        }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("prevents prescribing archived medicines", async () => {
    vi.spyOn(prisma.consultation, "findUnique").mockResolvedValue(mockConsultation as any);
    vi.spyOn(prescriptionRepository, "findByConsultationId").mockResolvedValue(null);
    vi.spyOn(prisma.medicine, "findMany").mockResolvedValue([
      { id: "med-1", name: "ArchivedDrug", strength: "10mg", isArchived: true } as any,
    ]);

    await expect(
      service.createPrescription(
        { id: "doc-1", role: "CLINICIAN" },
        {
          consultationId: "consult-1",
          items: [{ medicineId: "med-1", dosage: "10mg", frequency: "Daily", durationDays: 5, quantity: 5 }],
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
      service.updatePrescription(
        { id: "doc-1", role: "CLINICIAN" },
        "rx-1",
        { notes: "New updated notes" }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("issues prescription and assigns sequence number", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue(mockPrescription as any);
    const markIssuedSpy = vi.spyOn(prescriptionRepository, "markIssued").mockResolvedValue({
      ...mockPrescription,
      status: "ISSUED",
      prescriptionNo: "RX-2026-0001",
      issuedAt: new Date(),
    } as any);

    const issued = await service.issuePrescription({ id: "doc-1", role: "CLINICIAN" }, "rx-1");
    expect(markIssuedSpy).toHaveBeenCalled();
    expect(issued.status).toBe("ISSUED");
  });

  it("dispenses prescription and invokes dispenseMedicine for each item", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue({
      ...mockPrescription,
      status: "ISSUED",
    } as any);
    const markDispensedSpy = vi.spyOn(prescriptionRepository, "markDispensed").mockResolvedValue({
      ...mockPrescription,
      status: "DISPENSED",
      dispensedAt: new Date(),
    } as any);

    const result = await service.dispensePrescription({ id: "staff-1", role: "STAFF" }, "rx-1");
    expect(medicinesModule.dispenseMedicine).toHaveBeenCalledTimes(1);
    expect(medicinesModule.dispenseMedicine).toHaveBeenCalledWith(
      expect.objectContaining({
        medicineId: "med-1",
        quantity: 21,
        performedById: "staff-1",
        prescriptionId: "rx-1",
      })
    );
    expect(markDispensedSpy).toHaveBeenCalled();
    expect(result.status).toBe("DISPENSED");
  });

  it("rejects voiding an already dispensed prescription", async () => {
    vi.spyOn(prescriptionRepository, "findById").mockResolvedValue({
      ...mockPrescription,
      status: "DISPENSED",
    } as any);

    await expect(
      service.voidPrescription(
        { id: "doc-1", role: "CLINICIAN" },
        "rx-1",
        { voidReason: "Patient changed mind" }
      )
    ).rejects.toThrow(ConflictError);
  });

  it("requires a non-empty reason when voiding a prescription", async () => {
    await expect(
      service.voidPrescription(
        { id: "doc-1", role: "CLINICIAN" },
        "rx-1",
        { voidReason: "   " }
      )
    ).rejects.toThrow(ValidationError);
  });
});
