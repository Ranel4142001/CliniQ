"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { QUERY_KEYS } from "@/constants/query-keys";
import { CHAT_CONFIG } from "@backend/contracts";
import type {
  ChatParticipant,
  ConsultationChatDTO,
  ConsultationMessageDTO,
} from "@backend/contracts";
import type { ChatMessageView } from "@/features/consultations/utils/group-messages";

type ChatCache = Omit<ConsultationChatDTO, "messages"> & { messages: ChatMessageView[] };

const chatUrl = (appointmentId: string) => `/api/appointments/${appointmentId}/messages`;

/** Polls the chat thread while the tab is visible (TanStack pauses polling in background tabs). */
export function useConsultationChat(appointmentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CONSULTATIONS.chat(appointmentId),
    queryFn: async (): Promise<ChatCache> => (await apiClient.get<ConsultationChatDTO>(chatUrl(appointmentId))).data,
    refetchInterval: (query) => (query.state.status === "error" ? false : CHAT_CONFIG.POLL_INTERVAL_MS),
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

/** Sends a message, showing it immediately and rolling back if the request fails. */
export function useSendChatMessage(appointmentId: string, currentUser: ChatParticipant) {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.CONSULTATIONS.chat(appointmentId);

  return useMutation({
    mutationFn: async (body: string) =>
      (await apiClient.post<ConsultationMessageDTO>(chatUrl(appointmentId), { body })).data,
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ChatCache>(queryKey);
      const optimistic: ChatMessageView = {
        id: `pending-${crypto.randomUUID()}`,
        body,
        createdAt: new Date().toISOString(),
        readAt: null,
        sender: currentUser,
        isPending: true,
      };
      queryClient.setQueryData<ChatCache>(queryKey, (old) =>
        old ? { ...old, messages: [...old.messages, optimistic] } : old
      );
      return { previous };
    },
    onError: (error, _body, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      notify.error(error instanceof Error ? error.message : "Message could not be sent");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

/** Marks the other participant's messages as read whenever unread ones are on screen. */
export function useMarkChatRead(appointmentId: string, messages: ChatMessageView[], currentUserId: string) {
  const hasUnread = messages.some((m) => m.sender.id !== currentUserId && !m.readAt);

  useEffect(() => {
    if (!hasUnread || document.visibilityState !== "visible") return;
    apiClient.post(`${chatUrl(appointmentId)}/read`).catch(() => {
      // Read receipts are best-effort; the next poll retries.
    });
  }, [appointmentId, hasUnread, messages.length]);
}
