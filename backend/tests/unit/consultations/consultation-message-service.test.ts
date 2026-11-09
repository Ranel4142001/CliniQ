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
  listConversations: notImplemented,
  findChatContext: notImplemented,
  listRecent: notImplemented,
  create: notImplemented,
  markReadFor: notImplemented,
  findPresence: () => Promise.resolve(null),
  savePresence: () => Promise.resolve(),
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

describe("Consultation chat presence", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks the caller as seen on every poll and reports the other participant's status", async () => {
    mockContext();
    vi.spyOn(consultationMessageRepository, "listRecent").mockResolvedValue([]);
    const findSpy = vi.spyOn(consultationMessageRepository, "findPresence").mockResolvedValue({
      lastSeenAt: new Date(),
      typingAt: new Date(),
    });
    const saveSpy = vi.spyOn(consultationMessageRepository, "savePresence");

    const chat = await consultationMessageService.getChat({ id: CLINICIAN_ID }, APPOINTMENT_ID);

    expect(findSpy).toHaveBeenCalledWith(APPOINTMENT_ID, PATIENT_PROFILE_ID);
    expect(saveSpy).toHaveBeenCalledWith(APPOINTMENT_ID, CLINICIAN_ID, {
      lastSeenAt: expect.any(Date),
    });
    expect(chat.counterpart).toMatchObject({ isActive: true, isTyping: true });
  });

  it("records typing only for participants of an open chat", async () => {
    mockContext({ status: "COMPLETED" });
    const saveSpy = vi.spyOn(consultationMessageRepository, "savePresence");

    await expect(
      consultationMessageService.markTyping({ id: "other-clinician" }, APPOINTMENT_ID)
    ).rejects.toThrow(ForbiddenError);
    await expect(
      consultationMessageService.markTyping({ id: PATIENT_PROFILE_ID }, APPOINTMENT_ID)
    ).rejects.toThrow(ConflictError);
    expect(saveSpy).not.toHaveBeenCalled();
  });
});

describe("Messages inbox", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const row = (id: string, lastMessageAt: string | null, scheduledAt: string) => ({
    appointmentId: id,
    scheduledAt: new Date(scheduledAt),
    status: "CONFIRMED" as const,
    clinicianId: CLINICIAN_ID,
    clinicianName: "Dr. Alberto Cruz, MD",
    patient: { firstName: "Juan", middleName: null, lastName: "Dela Cruz" },
    lastMessage: lastMessageAt
      ? { body: "Hi", createdAt: new Date(lastMessageAt), senderId: PATIENT_PROFILE_ID }
      : null,
    unreadCount: 1,
  });

  it("names the other participant and orders chats by latest message", async () => {
    const listSpy = vi.spyOn(consultationMessageRepository, "listConversations").mockResolvedValue([
      row("no-messages", null, "2026-11-20T02:00:00Z"),
      row("older", "2026-11-01T02:00:00Z", "2026-11-01T02:00:00Z"),
      row("newer", "2026-11-05T02:00:00Z", "2026-10-01T02:00:00Z"),
    ]);

    const asClinician = await consultationMessageService.listConversations({ id: CLINICIAN_ID });
    expect(listSpy).toHaveBeenCalledWith(CLINICIAN_ID, expect.any(Number));
    expect(asClinician.map((c) => c.appointmentId)).toEqual(["newer", "older", "no-messages"]);
    expect(asClinician[0]).toMatchObject({
      counterpartName: "Juan Dela Cruz",
      canSend: true,
      lastMessage: { isMine: false },
    });

    const asPatient = await consultationMessageService.listConversations({ id: PATIENT_PROFILE_ID });
    expect(asPatient[0]).toMatchObject({
      counterpartName: "Dr. Alberto Cruz, MD",
      lastMessage: { isMine: true },
    });
  });
});
