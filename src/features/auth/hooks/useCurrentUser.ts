"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { UserProfile } from "../types/auth.types";

export function useCurrentUser() {
  const query = useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: async () => {
      const res = await apiClient.get<UserProfile>("/api/me");
      return res.data;
    },
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    error: query.error,
    refetch: query.refetch,
  };
}
