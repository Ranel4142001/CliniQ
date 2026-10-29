"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ReportKey, ReportFilterParams } from "@backend/contracts";

export const REPORT_KEYS = {
  all: ["reports"] as const,
  report: (key: ReportKey, filters: ReportFilterParams) =>
    [...REPORT_KEYS.all, key, filters] as const,
};

export function useReport<T extends Record<string, unknown>>(
  reportKey: ReportKey,
  filters: ReportFilterParams = {}
) {
  return useQuery({
    queryKey: REPORT_KEYS.report(reportKey, filters),
    queryFn: async () => {
      const res = await apiClient.get<T[]>(`/api/reports/${reportKey}`, {
        params: {
          from: filters.from,
          to: filters.to,
          status: filters.status,
          search: filters.search,
        },
      });
      return res.data ?? [];
    },
  });
}
