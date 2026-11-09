"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { CHAT_CONFIG } from "@backend/contracts";
import type { ChatConversationDTO } from "@backend/contracts";
import { getTotalUnread } from "@/features/consultations/utils/inbox";

const fetchConversations = async () =>
  (await apiClient.get<ChatConversationDTO[]>("/api/conversations")).data;

/** The Messages inbox, refreshed while the tab is visible. */
export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.CONSULTATIONS.conversations,
    queryFn: fetchConversations,
    refetchInterval: (query) =>
      query.state.status === "error" ? false : CHAT_CONFIG.INBOX_POLL_INTERVAL_MS,
  });
}

/** Total unread messages for the sidebar badge; shares the inbox query and cache. */
export function useUnreadChatCount(enabled: boolean): number {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.CONSULTATIONS.conversations,
    queryFn: fetchConversations,
    select: getTotalUnread,
    enabled,
    refetchInterval: (query) =>
      query.state.status === "error" ? false : CHAT_CONFIG.INBOX_POLL_INTERVAL_MS,
  });
  return enabled ? (data ?? 0) : 0;
}
