"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { CHAT_CONFIG, ROLES } from "@backend/contracts";
import type { ChatParticipant, FrontDeskChatDTO, FrontDeskThreadDTO } from "@backend/contracts";
import type { ChatMessageView } from "@/features/consultations/utils/group-messages";
import {
  useChatThread,
  useMarkThreadRead,
  useSendThreadMessage,
  type ChatThreadEndpoints,
} from "@/features/consultations/hooks/useChatThread";

type FrontDeskCache = Omit<FrontDeskChatDTO, "messages"> & { messages: ChatMessageView[] };

const threadUrl = (patientId: string) => `/api/front-desk/threads/${patientId}`;

function frontDeskEndpoints(patientId: string): ChatThreadEndpoints {
  return {
    queryKey: QUERY_KEYS.FRONT_DESK.chat(patientId),
    messagesUrl: `${threadUrl(patientId)}/messages`,
    readUrl: `${threadUrl(patientId)}/read`,
    inboxKey: QUERY_KEYS.FRONT_DESK.threads,
  };
}

/** Patients: their one clinic thread. Admins/staff: patients' threads, most recent first. */
export function useFrontDeskThreads(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.FRONT_DESK.threads,
    queryFn: async () => (await apiClient.get<FrontDeskThreadDTO[]>("/api/front-desk/threads")).data,
    enabled,
    refetchInterval: (query) =>
      query.state.status === "error" ? false : CHAT_CONFIG.INBOX_POLL_INTERVAL_MS,
  });
}

export function useFrontDeskChat(patientId: string) {
  return useChatThread<FrontDeskCache>(frontDeskEndpoints(patientId));
}

export function useSendFrontDeskMessage(patientId: string, currentUser: ChatParticipant) {
  return useSendThreadMessage(frontDeskEndpoints(patientId), currentUser);
}

/** Incoming means from the other side: the patient (for staff) or any staff member (for the patient). */
export function useMarkFrontDeskRead(patientId: string, messages: ChatMessageView[], viewerIsPatient: boolean) {
  const isIncoming = useCallback(
    (m: ChatMessageView) => (m.sender.role === ROLES.PATIENT) !== viewerIsPatient,
    [viewerIsPatient]
  );
  useMarkThreadRead(frontDeskEndpoints(patientId), messages, isIncoming);
}
