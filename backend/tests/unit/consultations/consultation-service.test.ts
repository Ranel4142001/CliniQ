import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsultationService } from "@backend/modules/consultations/application/services/consultation.service";
import { manualLinkProvider } from "@backend/modules/consultations/infrastructure/meeting/manual-link.provider";
import type { ConsultationRepositoryPort } from "@backend/modules/consultations/application/ports/outbound/consultation-repository.port";
import type { AppointmentAccessPort } from "@backend/modules/consultations/application/ports/outbound/appointment-access.port";
import { fakeAuditLog } from "../../support/fakes";
import {
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@backend/shared/domain/errors/app-error";

const notImplemented = () => Promise.reject(new Error("not stubbed in this test"));

const consultationRepository: ConsultationRepositoryPort = {
  findById: notImplemented,
  findByAppointmentId: notImplemented,
  create: notImplemented,
  update: notImplemented,
  completeInTransaction: notImplemented,
  list: notImplemented,
  count: notImplemented,
};

const appointmentService: AppointmentAccessPort = { getAppointment: notImplemented };

describe("ConsultationService Business Rules", () => {
  let service: ConsultationService;

  const mockConfirmedAppt = {
    id: "appt-1",
    patientId: "patient-1",
    clinicianId: "clinician-1",
    scheduledAt: new Date("2026-10-20T10:00:00.000Z"),
    endsAt: new Date("2026-10-20T10:30:00.000Z"),
    type: "ONLINE" as const,
    status: "CONFIRMED" as const,
    reason: "Routine Checkup",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    patient: { id: "patient-1", profileId: "profile-patient-1" },
    clinician: { id: "clinician-1", fullName: "Dr. Smith", email: "dr@cliniq.local" },
  };

  const mockConsultation = {
    id: "consult-1",
    appointmentId: "appt-1",
    patientId: "patient-1",
    clinicianId: "clinician-1",
    chiefComplaint: "Routine Checkup",
    vitals: null,
    findings: null,
    diagnosis: null,
    treatmentPlan: null,
    startedAt: new Date("2026-10-20T10:05:00.000Z"),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    appointment: mockConfirmedAppt as any,
    patient: { id: "patient-1", profileId: "profile-patient-1" } as any,
    clinician: {
      id: "clinician-1",
      fullName: "Dr. Smith",
      email: "dr@cliniq.local",
      role: "CLINICIAN" as const,
    },
    prescription: null,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new ConsultationService({
      consultationRepository,
      appointments: appointmentService,
      meetingProvider: manualLinkProvider,
      auditLog: fakeAuditLog(),
    });
  });

  describe("startConsultation", () => {
    it("fails if appointment is not in CONFIRMED status (e.g. PENDING)", async () => {
      vi.spyOn(consultationRepository, "findByAppointmentId").mockResolvedValue(null);
      vi.spyOn(appointmentService, "getAppointment").mockResolvedValue({
        ...mockConfirmedAppt,
        status: "PENDING",
      } as any);

      await expect(
        service.startConsultation(
          { id: "clinician-1", role: "CLINICIAN" },
          { appointmentId: "appt-1" }
        )
      ).rejects.toThrow(ConflictError);
    });

    it("prevents a different clinician from starting an unassigned consultation", async () => {
      vi.spyOn(consultationRepository, "findByAppointmentId").mockResolvedValue(null);
      vi.spyOn(appointmentService, "getAppointment").mockResolvedValue(mockConfirmedAppt as any);

      await expect(
        service.startConsultation(
          { id: "other-clinician", role: "CLINICIAN" },
          { appointmentId: "appt-1" }
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("creates a consultation with startedAt when started by assigned clinician", async () => {
      vi.spyOn(consultationRepository, "findByAppointmentId").mockResolvedValue(null);
      vi.spyOn(appointmentService, "getAppointment").mockResolvedValue(mockConfirmedAppt as any);
      const createSpy = vi
        .spyOn(consultationRepository, "create")
        .mockResolvedValue(mockConsultation);

      const res = await service.startConsultation(
        { id: "clinician-1", role: "CLINICIAN" },
        { appointmentId: "appt-1", chiefComplaint: "Custom complaint" }
      );

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: "appt-1",
          clinicianId: "clinician-1",
          chiefComplaint: "Custom complaint",
        })
      );
      expect(res.id).toBe("consult-1");
    });
  });

  describe("updateConsultation", () => {
    it("prevents modifying a consultation that has already ended (read-only)", async () => {
      vi.spyOn(consultationRepository, "findById").mockResolvedValue({
        ...mockConsultation,
        endedAt: new Date("2026-10-20T10:30:00.000Z"),
      });

      await expect(
        service.updateConsultation({ id: "clinician-1", role: "CLINICIAN" }, "consult-1", {
          findings: "New findings",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("prevents an unauthorized clinician from updating notes", async () => {
      vi.spyOn(consultationRepository, "findById").mockResolvedValue(mockConsultation);

      await expect(
        service.updateConsultation({ id: "unauthorized-doc", role: "CLINICIAN" }, "consult-1", {
          findings: "New findings",
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("completeConsultation", () => {
    it("requires a non-empty diagnosis to complete", async () => {
      vi.spyOn(consultationRepository, "findById").mockResolvedValue(mockConsultation);

      await expect(
        service.completeConsultation({ id: "clinician-1", role: "CLINICIAN" }, "consult-1", {
          diagnosis: "   ",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("calls completeInTransaction to end consultation and mark appointment completed", async () => {
      vi.spyOn(consultationRepository, "findById").mockResolvedValue(mockConsultation);
      const txSpy = vi.spyOn(consultationRepository, "completeInTransaction").mockResolvedValue({
        ...mockConsultation,
        diagnosis: "Upper Respiratory Tract Infection",
        endedAt: new Date(),
      });

      const res = await service.completeConsultation(
        { id: "clinician-1", role: "CLINICIAN" },
        "consult-1",
        {
          diagnosis: "Upper Respiratory Tract Infection",
          treatmentPlan: "Rest and hydration",
        }
      );

      expect(txSpy).toHaveBeenCalledWith(
        "consult-1",
        "appt-1",
        expect.objectContaining({
          diagnosis: "Upper Respiratory Tract Infection",
          treatmentPlan: "Rest and hydration",
        })
      );
      expect(res.diagnosis).toBe("Upper Respiratory Tract Infection");
    });
  });

  describe("resolveMeetingLink", () => {
    it("resolves valid Google Meet URL from appointment", async () => {
      const link = await service.resolveMeetingLink({
        id: "appt-1",
        meetingUrl: "https://meet.google.com/xyz-uvwx-rst",
      });
      expect(link).toBe("https://meet.google.com/xyz-uvwx-rst");
    });

    it("throws ValidationError if meetingUrl is missing", async () => {
      await expect(service.resolveMeetingLink({ id: "appt-1", meetingUrl: null })).rejects.toThrow(
        ValidationError
      );
    });
  });
});
