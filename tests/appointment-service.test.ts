import { describe, it, expect, vi, beforeEach } from "vitest";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import { appointmentRepository } from "@/features/appointments/repositories/appointment.repository";
import { patientRepository } from "@/features/patients/repositories/patient.repository";
import { ConflictError, ForbiddenError, ValidationError } from "@/shared/lib/errors";

vi.mock("@/features/appointments/repositories/appointment.repository", () => ({
  appointmentRepository: {
    findById: vi.fn(),
    findOverlapping: vi.fn(),
    findByClinicianAndDate: vi.fn(),
    list: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/features/patients/repositories/patient.repository", () => ({
  patientRepository: {
    findById: vi.fn(),
    findByProfileId: vi.fn(),
  },
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (cb) => {
      const mockTx = {};
      return cb(mockTx);
    }),
  },
}));

vi.mock("@/shared/lib/audit", () => ({
  auditRepository: {
    log: vi.fn().mockResolvedValue({ id: "audit-1" }),
  },
}));

describe("Appointment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(); // 3 days in future

  it("throws ValidationError when booking in the past", async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    await expect(
      appointmentService.bookAppointment("STAFF", "staff-1", {
        patientId: "00000000-0000-0000-0000-000000000001",
        clinicianId: "00000000-0000-0000-0000-000000000002",
        scheduledAt: pastDate,
        type: "IN_PERSON",
        reason: "Fever checkup",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("throws ConflictError when double-booking a clinician", async () => {
    vi.mocked(patientRepository.findById).mockResolvedValueOnce({
      id: "pt-1",
      isArchived: false,
    } as any);

    vi.mocked(appointmentRepository.findOverlapping).mockResolvedValueOnce([
      {
        id: "existing-appt",
        clinicianId: "doc-1",
        patientId: "other-pt",
        scheduledAt: new Date(futureDate),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1800000),
        status: "CONFIRMED",
      },
    ]);

    await expect(
      appointmentService.bookAppointment("STAFF", "staff-1", {
        patientId: "pt-1",
        clinicianId: "doc-1",
        scheduledAt: futureDate,
        type: "IN_PERSON",
        reason: "Fever checkup",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("prevents PATIENT from viewing another patient's appointment", async () => {
    vi.mocked(appointmentRepository.findById).mockResolvedValueOnce({
      id: "appt-1",
      patientId: "pt-1",
      patient: {
        profileId: "different-user-profile",
      },
    } as any);

    await expect(
      appointmentService.getAppointment("PATIENT", "my-profile-id", "appt-1")
    ).rejects.toThrow(ForbiddenError);
  });

  it("prevents PATIENT from confirming their own appointment", async () => {
    vi.mocked(appointmentRepository.findById).mockResolvedValueOnce({
      id: "appt-1",
      patientId: "pt-1",
      patient: {
        profileId: "my-profile-id",
      },
      status: "PENDING",
      type: "IN_PERSON",
      scheduledAt: new Date(futureDate),
    } as any);

    await expect(
      appointmentService.updateStatus("PATIENT", "my-profile-id", "appt-1", {
        status: "CONFIRMED",
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ValidationError when attempting invalid status jump (PENDING to COMPLETED)", async () => {
    vi.mocked(appointmentRepository.findById).mockResolvedValueOnce({
      id: "appt-1",
      patientId: "pt-1",
      patient: {
        profileId: "pt-profile",
      },
      status: "PENDING",
      type: "IN_PERSON",
      scheduledAt: new Date(futureDate),
    } as any);

    await expect(
      appointmentService.updateStatus("STAFF", "staff-1", "appt-1", {
        status: "COMPLETED",
      })
    ).rejects.toThrow(ValidationError);
  });
});
