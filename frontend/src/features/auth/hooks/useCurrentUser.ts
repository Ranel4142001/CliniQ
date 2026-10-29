"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { UserProfile } from "@backend/contracts";

export function useCurrentUser() {
  const query = useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: async () => {
      const res = await apiClient.get<UserProfile>("/api/me");
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes - user profile is stable
    gcTime: 1000 * 60 * 30, // 30 minutes in memory cache
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    error: query.error,
    refetch: query.refetch,
  };
}
