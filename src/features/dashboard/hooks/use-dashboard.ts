"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { DashboardResponse } from "../types/dashboard.types";

export const DASHBOARD_KEYS = {
  all: ["dashboard"] as const,
  data: () => [...DASHBOARD_KEYS.all, "data"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.data(),
    queryFn: async () => {
      const res = await apiClient.get<DashboardResponse>("/api/dashboard");
      return res.data;
    },
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}
