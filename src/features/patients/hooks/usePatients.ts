"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { PatientListItem } from "../types/patient.types";
import type { Paginated } from "@/shared/types/api";

export interface UsePatientsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isArchived?: boolean;
}

export function usePatients(params: UsePatientsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PATIENTS.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params.search) searchParams.set("search", params.search);
      if (params.isArchived !== undefined) searchParams.set("isArchived", String(params.isArchived));

      const res = await apiClient.get<PatientListItem[]>(
        `/api/patients?${searchParams.toString()}`
      );
      return {
        items: res.data,
        meta: res.meta as unknown as Paginated<PatientListItem>,
      };
    },
    staleTime: 1000 * 30, // 30s
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}
