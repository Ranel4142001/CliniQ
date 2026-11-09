"use client";

import { useMemo } from "react";
import { ROLES, type Role } from "@backend/contracts";
import { useConversations } from "@/features/consultations/hooks/useConversations";
import { useFrontDeskThreads } from "@/features/consultations/hooks/useFrontDesk";
import { hasConsultationChats, hasFrontDeskChat } from "@/features/consultations/utils/chat-roles";
import {
  fromConsultation,
  fromFrontDeskThread,
  getTotalUnread,
  sortInbox,
  type InboxItem,
} from "@/features/consultations/utils/inbox";

/**
 * Everything in the viewer's Messages list: consultation chats (patients, clinicians) and
 * front-desk threads (patients, admins, staff), merged and sorted.
 */
export function useInbox(role?: Role | null) {
  const isPatient = role === ROLES.PATIENT;
  const withConsultations = hasConsultationChats(role);
  const withFrontDesk = hasFrontDeskChat(role);
  const consultations = useConversations(withConsultations);
  const desk = useFrontDeskThreads(withFrontDesk);
  const sources = [
    ...(withConsultations ? [consultations] : []),
    ...(withFrontDesk ? [desk] : []),
  ];

  const items = useMemo<InboxItem[]>(
    () =>
      sortInbox(
        [
          ...(consultations.data ?? []).map(fromConsultation),
          ...(desk.data ?? []).map((thread) => fromFrontDeskThread(thread, isPatient)),
        ],
        isPatient
      ),
    [consultations.data, desk.data, isPatient]
  );

  return {
    items,
    unreadCount: getTotalUnread(items),
    isLoading: sources.some((query) => query.isLoading),
    error: sources.find((query) => query.error)?.error ?? null,
    refetch: () => sources.forEach((query) => query.refetch()),
  };
}
