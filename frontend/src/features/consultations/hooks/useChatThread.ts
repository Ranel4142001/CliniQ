"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { CHAT_CONFIG } from "@backend/contracts";
import type { ChatParticipant, ConsultationMessageDTO } from "@backend/contracts";
import type { ChatMessageView } from "@/features/consultations/utils/group-messages";

/** Where one chat thread lives: its cache key, message URL, and the inbox list it feeds. */
export interface ChatThreadEndpoints {
  queryKey: QueryKey;
  /** GET the thread, POST a message. */
  messagesUrl: string;
  /** POST to mark the other side's messages as read. */
  readUrl: string;
  /** Inbox query to refresh after sending or reading (unread counts, previews). */
  inboxKey: QueryKey;
}

type ThreadCache = { messages: ChatMessageView[] };

/** Polls a chat thread while the tab is visible (TanStack pauses polling in background tabs). */
export function useChatThread<T extends ThreadCache>({ queryKey, messagesUrl }: ChatThreadEndpoints) {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => (await apiClient.get<T>(messagesUrl)).data,
    refetchInterval: (query) => (query.state.status === "error" ? false : CHAT_CONFIG.POLL_INTERVAL_MS),
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

/** Sends a message, showing it immediately and rolling back if the request fails. */
export function useSendThreadMessage(endpoints: ChatThreadEndpoints, currentUser: ChatParticipant) {
  const queryClient = useQueryClient();
  const { queryKey, messagesUrl, inboxKey } = endpoints;

  return useMutation({
    mutationFn: async (body: string) =>
      (await apiClient.post<ConsultationMessageDTO>(messagesUrl, { body })).data,
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ThreadCache>(queryKey);
      const optimistic: ChatMessageView = {
        id: `pending-${crypto.randomUUID()}`,
        body,
        createdAt: new Date().toISOString(),
        readAt: null,
        sender: currentUser,
        isPending: true,
      };
      queryClient.setQueryData<ThreadCache>(queryKey, (old) =>
        old ? { ...old, messages: [...old.messages, optimistic] } : old
      );
      return { previous };
    },
    onError: (error, _body, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      notify.error(error instanceof Error ? error.message : "Message could not be sent");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: inboxKey });
    },
  });
}

/** Marks incoming messages as read whenever unread ones are on screen. */
export function useMarkThreadRead(
  { readUrl, inboxKey }: ChatThreadEndpoints,
  messages: ChatMessageView[],
  isIncoming: (message: ChatMessageView) => boolean
) {
  const queryClient = useQueryClient();
  const hasUnread = messages.some((m) => isIncoming(m) && !m.readAt);

  useEffect(() => {
    if (!hasUnread || document.visibilityState !== "visible") return;
    apiClient
      .post(readUrl)
      // Clears this chat's unread count in the inbox and the sidebar badge right away.
      .then(() => queryClient.invalidateQueries({ queryKey: inboxKey }))
      .catch(() => {
        // Read receipts are best-effort; the next poll retries.
      });
  }, [readUrl, inboxKey, hasUnread, messages.length, queryClient]);
}
