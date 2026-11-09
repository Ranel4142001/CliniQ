"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { CHAT_CONFIG } from "@backend/contracts";
import type { ChatConversationDTO } from "@backend/contracts";

/** The viewer's consultation chats, refreshed while the tab is visible. */
export function useConversations(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.CONSULTATIONS.conversations,
    queryFn: async () => (await apiClient.get<ChatConversationDTO[]>("/api/conversations")).data,
    enabled,
    refetchInterval: (query) =>
      query.state.status === "error" ? false : CHAT_CONFIG.INBOX_POLL_INTERVAL_MS,
  });
}
