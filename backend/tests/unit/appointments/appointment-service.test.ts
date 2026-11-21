import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAppointmentService } from "@backend/modules/appointments/application/services/appointment.service";
import {
  ConflictError,
  ForbiddenError,
  ValidationError,
} from "@backend/shared/domain/errors/app-error";
import { fakeAuditLog, fakeTransactions } from "../../support/fakes";

const appointmentRepository = {
  findById: vi.fn(),
  isActiveClinician: vi.fn(),
  findOverlapping: vi.fn(),
  findByClinicianAndDate: vi.fn(),
  list: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

const patientRepository = {
  findById: vi.fn(),
  findByProfileId: vi.fn(),
};

const appointmentService = createAppointmentService({
  appointmentRepository,
  patientDirectory: patientRepository,
  transactions: fakeTransactions(),
  auditRepository: fakeAuditLog(),
});

describe("Appointment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(appointmentRepository.isActiveClinician).mockResolvedValue(true);
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

  it("ignores a meeting link sent by a PATIENT when they cancel", async () => {
    vi.mocked(appointmentRepository.findById).mockResolvedValueOnce({
      id: "appt-1",
      patientId: "pt-1",
      patient: { profileId: "my-profile-id" },
      status: "CONFIRMED",
      type: "ONLINE",
      meetingUrl: "https://meet.example.com/real",
      scheduledAt: new Date(futureDate),
    } as any);
    vi.mocked(appointmentRepository.update).mockImplementationOnce(
      async (_id, data) => data as any
    );

    await appointmentService
      .updateStatus("PATIENT", "my-profile-id", "appt-1", {
        status: "CANCELLED",
        cancelReason: "Can't make it",
        meetingUrl: "https://evil.example.com/phish",
      })
      .catch(() => undefined);

    expect(appointmentRepository.update).toHaveBeenCalledWith(
      "appt-1",
      expect.objectContaining({ meetingUrl: "https://meet.example.com/real" })
    );
  });

  it("refuses a booking whose clinician is not an active clinician", async () => {
    vi.mocked(patientRepository.findById).mockResolvedValueOnce({
      id: "pt-1",
      isArchived: false,
    } as any);
    vi.mocked(appointmentRepository.isActiveClinician).mockResolvedValueOnce(false);

    await expect(
      appointmentService.bookAppointment("STAFF", "staff-1", {
        patientId: "pt-1",
        clinicianId: "not-a-doctor",
        scheduledAt: futureDate,
        type: "IN_PERSON",
        reason: "Fever checkup",
      })
    ).rejects.toThrow(ValidationError);
    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });
});
