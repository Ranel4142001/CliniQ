import { describe, it, expect, vi, afterEach } from "vitest";
import { createConsultationMessageService } from "@backend/modules/consultations/application/services/consultation-message.service";
import type { ConsultationMessageRepositoryPort } from "@backend/modules/consultations/application/ports/outbound/consultation-message-repository.port";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@backend/shared/domain/errors/app-error";

const notImplemented = () => Promise.reject(new Error("not stubbed in this test"));

const consultationMessageRepository: ConsultationMessageRepositoryPort = {
  findChatContext: notImplemented,
  listRecent: notImplemented,
  create: notImplemented,
  markReadFor: notImplemented,
};

const consultationMessageService = createConsultationMessageService({
  consultationMessageRepository,
});

const CLINICIAN_ID = "clinician-1";
const PATIENT_PROFILE_ID = "patient-profile-1";
const APPOINTMENT_ID = "appt-1";

function mockContext(overrides: Partial<{ type: "ONLINE" | "IN_PERSON"; status: string }> = {}) {
  return vi.spyOn(consultationMessageRepository, "findChatContext").mockResolvedValue({
    id: APPOINTMENT_ID,
    type: overrides.type ?? "ONLINE",
    status: (overrides.status ?? "CONFIRMED") as "CONFIRMED",
    clinicianId: CLINICIAN_ID,
    patient: { profileId: PATIENT_PROFILE_ID },
  });
}

const sentMessage = {
  id: "msg-1",
  body: "Hello doctor",
  createdAt: new Date(),
  readAt: null,
  sender: { id: PATIENT_PROFILE_ID, fullName: "Juan Dela Cruz", role: "PATIENT" as const },
};

describe("Consultation chat access rules", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lets the patient and the assigned clinician read the chat", async () => {
    mockContext();
    vi.spyOn(consultationMessageRepository, "listRecent").mockResolvedValue([sentMessage]);

    for (const id of [PATIENT_PROFILE_ID, CLINICIAN_ID]) {
      const chat = await consultationMessageService.getChat({ id }, APPOINTMENT_ID);
      expect(chat.messages).toHaveLength(1);
      expect(chat.canSend).toBe(true);
    }
  });

  it("blocks anyone who is not a participant, including other clinicians", async () => {
    mockContext();
    await expect(
      consultationMessageService.getChat({ id: "other-clinician" }, APPOINTMENT_ID)
    ).rejects.toThrow(ForbiddenError);
  });

  it("returns NotFound for unknown appointments", async () => {
    vi.spyOn(consultationMessageRepository, "findChatContext").mockResolvedValue(null);
    await expect(
      consultationMessageService.getChat({ id: CLINICIAN_ID }, "missing")
    ).rejects.toThrow(NotFoundError);
  });

  it("is only available for online appointments", async () => {
    mockContext({ type: "IN_PERSON" });
    await expect(
      consultationMessageService.getChat({ id: CLINICIAN_ID }, APPOINTMENT_ID)
    ).rejects.toThrow(ConflictError);
  });

  it("makes the chat read-only once the appointment is no longer confirmed", async () => {
    mockContext({ status: "COMPLETED" });
    vi.spyOn(consultationMessageRepository, "listRecent").mockResolvedValue([]);
    const createSpy = vi.spyOn(consultationMessageRepository, "create");

    const chat = await consultationMessageService.getChat(
      { id: PATIENT_PROFILE_ID },
      APPOINTMENT_ID
    );
    expect(chat.canSend).toBe(false);
    await expect(
      consultationMessageService.sendMessage({ id: PATIENT_PROFILE_ID }, APPOINTMENT_ID, {
        body: "Hi",
      })
    ).rejects.toThrow(ConflictError);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("records the authenticated user as sender, never a client-supplied id", async () => {
    mockContext();
    const createSpy = vi
      .spyOn(consultationMessageRepository, "create")
      .mockResolvedValue(sentMessage);

    await consultationMessageService.sendMessage({ id: PATIENT_PROFILE_ID }, APPOINTMENT_ID, {
      body: "Hello doctor",
    });
    expect(createSpy).toHaveBeenCalledWith({
      appointmentId: APPOINTMENT_ID,
      senderId: PATIENT_PROFILE_ID,
      body: "Hello doctor",
    });
  });

  it("only marks the other participant's messages as read", async () => {
    mockContext();
    const markSpy = vi.spyOn(consultationMessageRepository, "markReadFor").mockResolvedValue(2);

    const result = await consultationMessageService.markAsRead(
      { id: CLINICIAN_ID },
      APPOINTMENT_ID
    );
    expect(markSpy).toHaveBeenCalledWith(APPOINTMENT_ID, CLINICIAN_ID);
    expect(result.updated).toBe(2);
  });
});
