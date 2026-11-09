import { describe, it, expect } from "vitest";
import type { ChatConversationDTO, FrontDeskThreadDTO } from "@backend/contracts";
import {
  filterInbox,
  formatInboxTimestamp,
  fromConsultation,
  fromFrontDeskThread,
  getTotalUnread,
  sortInbox,
} from "@/features/consultations/utils/inbox";
import { hasConsultationChats, hasFrontDeskChat } from "@/features/consultations/utils/chat-roles";
import { formatBadgeCount } from "@/lib/format";

function conversation(overrides: Partial<ChatConversationDTO> = {}): ChatConversationDTO {
  return {
    appointmentId: "appt-1",
    counterpartName: "Dr. Alberto Cruz, MD",
    scheduledAt: "2026-10-29T02:00:00Z",
    status: "CONFIRMED",
    canSend: true,
    lastMessage: null,
    unreadCount: 0,
    ...overrides,
  };
}

function deskThread(overrides: Partial<FrontDeskThreadDTO> = {}): FrontDeskThreadDTO {
  return {
    patientId: "patient-1",
    patientName: "Maria Clara Santos",
    patientNo: "PT-2026-11-10-482",
    lastMessage: null,
    unreadCount: 0,
    ...overrides,
  };
}

const message = (createdAt: string, isMine = false) => ({ body: "Hi", createdAt, isMine });

describe("formatInboxTimestamp", () => {
  const NOW = "2026-10-29T06:00:00Z"; // Thu 2:00 PM Manila

  it("shortens like Messenger: time today, weekday this week, then the date", () => {
    expect(formatInboxTimestamp("2026-10-29T02:00:00Z", NOW)).toBe("10:00 AM");
    expect(formatInboxTimestamp("2026-10-26T02:00:00Z", NOW)).toBe("Mon");
    expect(formatInboxTimestamp("2026-09-03T02:00:00Z", NOW)).toBe("Sep 3");
    expect(formatInboxTimestamp("2025-09-03T02:00:00Z", NOW)).toBe("Sep 3, 2025");
  });
});

describe("inbox items", () => {
  it("previews consultation chats with 'You:' and flattened line breaks", () => {
    const item = fromConsultation(
      conversation({ lastMessage: { body: "See you\nat 3", createdAt: "2026-10-29T02:00:00Z", isMine: true } })
    );
    expect(item.preview).toBe("You: See you at 3");
    expect(fromConsultation(conversation()).preview).toBe("Say hello 👋");
    expect(fromConsultation(conversation({ canSend: false })).preview).toBe("No messages");
  });

  it("shows the front desk to patients and the patient to staff", () => {
    const asPatient = fromFrontDeskThread(deskThread(), true);
    const asStaff = fromFrontDeskThread(deskThread({ lastMessage: message("2026-10-29T02:00:00Z", true) }), false);
    expect(asPatient).toMatchObject({ title: "Clinic front desk", avatar: "clinic", href: "/messages/desk/patient-1" });
    expect(asStaff).toMatchObject({ title: "Maria Clara Santos", avatar: "person", preview: "Clinic: Hi" });
  });

  it("sorts newest message first and pins the front desk for patients", () => {
    const old = fromConsultation(conversation({ appointmentId: "old", lastMessage: message("2026-10-01T02:00:00Z") }));
    const recent = fromConsultation(conversation({ appointmentId: "new", lastMessage: message("2026-10-28T02:00:00Z") }));
    const empty = fromConsultation(conversation({ appointmentId: "empty" }));
    const desk = fromFrontDeskThread(deskThread(), true);

    expect(sortInbox([empty, old, desk, recent], false).map((i) => i.key)).toEqual([
      "consultation-new",
      "consultation-old",
      "consultation-empty",
      "desk-patient-1",
    ]);
    expect(sortInbox([empty, old, desk, recent], true)[0].key).toBe("desk-patient-1");
  });

  it("filters by name or patient number and sums unread counts", () => {
    const items = [fromConsultation(conversation()), fromFrontDeskThread(deskThread({ unreadCount: 3 }), false)];
    expect(filterInbox(items, "  ")).toHaveLength(2);
    expect(filterInbox(items, "pt-2026-11").map((i) => i.title)).toEqual(["Maria Clara Santos"]);
    expect(getTotalUnread(items)).toBe(3);
    expect(formatBadgeCount(150)).toBe("99+");
  });
});

describe("chat roles", () => {
  it("gives every role a Messages inbox with the right kinds of chat", () => {
    expect([hasConsultationChats("PATIENT"), hasFrontDeskChat("PATIENT")]).toEqual([true, true]);
    expect([hasConsultationChats("CLINICIAN"), hasFrontDeskChat("CLINICIAN")]).toEqual([true, false]);
    expect([hasConsultationChats("STAFF"), hasFrontDeskChat("STAFF")]).toEqual([false, true]);
    expect([hasConsultationChats("ADMIN"), hasFrontDeskChat("ADMIN")]).toEqual([false, true]);
  });
});
