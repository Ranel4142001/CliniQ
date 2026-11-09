import { describe, it, expect, vi, afterEach } from "vitest";
import { createFrontDeskService } from "@backend/modules/front-desk/application/services/front-desk.service";
import type { FrontDeskRepositoryPort } from "@backend/modules/front-desk/application/ports/outbound/front-desk-repository.port";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@backend/shared/domain/errors/app-error";

const notImplemented = () => Promise.reject(new Error("not stubbed in this test"));

const frontDeskRepository: FrontDeskRepositoryPort = {
  findPatient: notImplemented,
  findPatientByProfileId: notImplemented,
  listActivePatientIds: notImplemented,
  summarizeThreads: notImplemented,
  listRecent: () => Promise.resolve([]),
  create: notImplemented,
  markRead: notImplemented,
};

const service = createFrontDeskService({ frontDeskRepository });

const PATIENT_ID = "11111111-1111-4111-8111-111111111111";
const PATIENT_PROFILE = { id: "patient-profile", role: "PATIENT" as const };
const STAFF = { id: "staff-1", role: "STAFF" as const };
const ADMIN = { id: "admin-1", role: "ADMIN" as const };
const CLINICIAN = { id: "clinician-1", role: "CLINICIAN" as const };

const patient = {
  id: PATIENT_ID,
  profileId: PATIENT_PROFILE.id,
  patientNo: "PT-261110-347",
  firstName: "Maria Clara",
  middleName: null,
  lastName: "Santos",
};

const sentMessage = {
  id: "m1",
  body: "Hi",
  createdAt: new Date(),
  readAt: null,
  sender: { id: STAFF.id, fullName: "Ana Santos", role: "STAFF" as const },
};

describe("Front-desk chat access", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lets admins, staff and the patient themselves open the thread", async () => {
    vi.spyOn(frontDeskRepository, "findPatient").mockResolvedValue(patient);
    for (const viewer of [STAFF, ADMIN, PATIENT_PROFILE]) {
      const chat = await service.getChat(viewer, PATIENT_ID);
      expect(chat).toMatchObject({ canSend: true, patientName: "Maria Clara Santos" });
    }
  });

  it("keeps clinicians and other patients out", async () => {
    vi.spyOn(frontDeskRepository, "findPatient").mockResolvedValue(patient);
    await expect(service.getChat(CLINICIAN, PATIENT_ID)).rejects.toThrow(ForbiddenError);
    await expect(
      service.getChat({ id: "someone-else", role: "PATIENT" }, PATIENT_ID)
    ).rejects.toThrow(ForbiddenError);
  });

  it("returns NotFound for unknown patients", async () => {
    vi.spyOn(frontDeskRepository, "findPatient").mockResolvedValue(null);
    await expect(service.getChat(STAFF, PATIENT_ID)).rejects.toThrow(NotFoundError);
  });

  it("records which side wrote the message from the session, not the client", async () => {
    vi.spyOn(frontDeskRepository, "findPatient").mockResolvedValue(patient);
    const createSpy = vi.spyOn(frontDeskRepository, "create").mockResolvedValue(sentMessage);

    await service.sendMessage(STAFF, PATIENT_ID, { body: "Your medicine is ready" });
    await service.sendMessage(PATIENT_PROFILE, PATIENT_ID, { body: "Thank you" });

    expect(createSpy.mock.calls.map(([data]) => [data.senderId, data.isFromPatient])).toEqual([
      [STAFF.id, false],
      [PATIENT_PROFILE.id, true],
    ]);
  });

  it("does not send to patients without an app account", async () => {
    vi.spyOn(frontDeskRepository, "findPatient").mockResolvedValue({ ...patient, profileId: null });
    const createSpy = vi.spyOn(frontDeskRepository, "create");

    expect((await service.getChat(STAFF, PATIENT_ID)).canSend).toBe(false);
    await expect(service.sendMessage(STAFF, PATIENT_ID, { body: "Hello" })).rejects.toThrow(
      ConflictError
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("marks only the other side's messages as read", async () => {
    vi.spyOn(frontDeskRepository, "findPatient").mockResolvedValue(patient);
    const markSpy = vi.spyOn(frontDeskRepository, "markRead").mockResolvedValue(1);

    await service.markAsRead(STAFF, PATIENT_ID);
    await service.markAsRead(PATIENT_PROFILE, PATIENT_ID);
    expect(markSpy.mock.calls).toEqual([
      [PATIENT_ID, false],
      [PATIENT_ID, true],
    ]);
  });
});

describe("Front-desk inbox", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const record = (isFromPatient: boolean) => ({
    patient,
    lastMessage: { body: "Hi", createdAt: new Date(), isFromPatient },
    unreadCount: 2,
  });

  it("shows the desk active threads with patient-side unread counts", async () => {
    vi.spyOn(frontDeskRepository, "listActivePatientIds").mockResolvedValue([PATIENT_ID]);
    const summarize = vi
      .spyOn(frontDeskRepository, "summarizeThreads")
      .mockResolvedValue([record(true)]);

    const threads = await service.listThreads(STAFF);
    expect(summarize).toHaveBeenCalledWith([PATIENT_ID], true);
    expect(threads[0]).toMatchObject({ patientId: PATIENT_ID, unreadCount: 2, lastMessage: { isMine: false } });
  });

  it("gives a patient only their own thread, counting the desk's unread replies", async () => {
    vi.spyOn(frontDeskRepository, "findPatientByProfileId").mockResolvedValue(patient);
    const summarize = vi
      .spyOn(frontDeskRepository, "summarizeThreads")
      .mockResolvedValue([record(true)]);

    const threads = await service.listThreads(PATIENT_PROFILE);
    expect(summarize).toHaveBeenCalledWith([PATIENT_ID], false);
    expect(threads[0].lastMessage?.isMine).toBe(true);
  });

  it("has no inbox for clinicians", async () => {
    await expect(service.listThreads(CLINICIAN)).rejects.toThrow(ForbiddenError);
  });
});
