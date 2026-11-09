"use client";

import { useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { CHAT_CONFIG } from "@backend/contracts";
import type { ChatParticipant, ConsultationChatDTO } from "@backend/contracts";
import type { ChatMessageView } from "@/features/consultations/utils/group-messages";
import {
  useChatThread,
  useMarkThreadRead,
  useSendThreadMessage,
  type ChatThreadEndpoints,
} from "@/features/consultations/hooks/useChatThread";

type ChatCache = Omit<ConsultationChatDTO, "messages"> & { messages: ChatMessageView[] };

const chatUrl = (appointmentId: string) => `/api/appointments/${appointmentId}/messages`;

function consultationEndpoints(appointmentId: string): ChatThreadEndpoints {
  return {
    queryKey: QUERY_KEYS.CONSULTATIONS.chat(appointmentId),
    messagesUrl: chatUrl(appointmentId),
    readUrl: `${chatUrl(appointmentId)}/read`,
    inboxKey: QUERY_KEYS.CONSULTATIONS.conversations,
  };
}

export function useConsultationChat(appointmentId: string) {
  return useChatThread<ChatCache>(consultationEndpoints(appointmentId));
}

export function useSendChatMessage(appointmentId: string, currentUser: ChatParticipant) {
  return useSendThreadMessage(consultationEndpoints(appointmentId), currentUser);
}

/** Returns a callback for each keystroke; it tells the server "typing" at most once per interval. */
export function useTypingPing(appointmentId: string) {
  const lastPingRef = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastPingRef.current < CHAT_CONFIG.TYPING_PING_INTERVAL_MS) return;
    lastPingRef.current = now;
    apiClient.post(`${chatUrl(appointmentId)}/typing`).catch(() => {
      // Typing status is best-effort; the next keystroke retries.
    });
  }, [appointmentId]);
}

/** Marks the other participant's messages as read whenever unread ones are on screen. */
export function useMarkChatRead(appointmentId: string, messages: ChatMessageView[], currentUserId: string) {
  const isIncoming = useCallback((m: ChatMessageView) => m.sender.id !== currentUserId, [currentUserId]);
  useMarkThreadRead(consultationEndpoints(appointmentId), messages, isIncoming);
}
