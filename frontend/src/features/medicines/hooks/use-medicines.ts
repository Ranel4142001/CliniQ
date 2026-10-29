"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import type {
  MedicineWithStock,
  AlertsDTO,
  StockMovementWithRelations,
} from "@backend/contracts";
import type {
  CreateMedicineInput,
  UpdateMedicineInput,
  StockInInput,
  StockOutInput,
  AdjustmentInput,
  ListMedicinesInput,
  ListMovementsInput,
} from "@backend/contracts";

export const MEDICINE_KEYS = {
  all: ["medicines"] as const,
  lists: () => [...MEDICINE_KEYS.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...MEDICINE_KEYS.lists(), params] as const,
  details: () => [...MEDICINE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...MEDICINE_KEYS.details(), id] as const,
  alerts: () => [...MEDICINE_KEYS.all, "alerts"] as const,
  movements: (params: Record<string, unknown>) => [...MEDICINE_KEYS.all, "movements", params] as const,
};

export function useMedicines(params: Partial<ListMedicinesInput> = {}) {
  return useQuery({
    queryKey: MEDICINE_KEYS.list(params),
    queryFn: async () => {
      const res = await apiClient.get<MedicineWithStock[]>("/api/medicines", {
        params: {
          search: params.search,
          isArchived: params.isArchived,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      });
      return {
        items: res.data ?? [],
        meta: res.meta,
      };
    },
    placeholderData: (prev) => prev, // no flash on filter/page change
  });
}

export function useMedicine(id?: string) {
  return useQuery({
    queryKey: MEDICINE_KEYS.detail(id || ""),
    queryFn: async () => {
      const res = await apiClient.get<MedicineWithStock>(`/api/medicines/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useMedicineAlerts() {
  return useQuery({
    queryKey: MEDICINE_KEYS.alerts(),
    queryFn: async () => {
      const res = await apiClient.get<AlertsDTO>("/api/medicines/alerts");
      return res.data;
    },
    staleTime: 1000 * 30, // 30s
    gcTime: 1000 * 60 * 5,
  });
}

export function useStockMovements(
  params: Partial<ListMovementsInput> = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: MEDICINE_KEYS.movements(params),
    queryFn: async () => {
      const res = await apiClient.get<StockMovementWithRelations[]>("/api/medicines/movements", {
        params: {
          medicineId: params.medicineId,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      });
      return {
        items: res.data ?? [],
        meta: res.meta,
      };
    },
    enabled: options?.enabled ?? Boolean(params.medicineId),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMedicineInput) => {
      const res = await apiClient.post<MedicineWithStock>("/api/medicines", input);
      return res.data;
    },
    onSuccess: () => {
      notify.success("Medicine added to inventory");
      queryClient.invalidateQueries({ queryKey: MEDICINE_KEYS.all });
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to create medicine");
    },
  });
}

export function useUpdateMedicine(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMedicineInput) => {
      const res = await apiClient.patch<MedicineWithStock>(`/api/medicines/${id}`, input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Medicine updated");
      queryClient.invalidateQueries({ queryKey: MEDICINE_KEYS.all });
      queryClient.setQueryData(MEDICINE_KEYS.detail(id), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to update medicine");
    },
  });
}

export function useStockIn(medicineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StockInInput) => {
      const res = await apiClient.post(`/api/medicines/${medicineId}/batches`, input);
      return res.data;
    },
    onSuccess: () => {
      notify.success("Stock added successfully");
      queryClient.invalidateQueries({ queryKey: MEDICINE_KEYS.all });
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to stock in");
    },
  });
}

export function useStockOut(medicineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StockOutInput) => {
      const res = await apiClient.post(`/api/medicines/${medicineId}/movements`, {
        ...input,
        type: "STOCK_OUT",
      });
      return res.data;
    },
    onSuccess: () => {
      notify.success("Stock deducted successfully");
      queryClient.invalidateQueries({ queryKey: MEDICINE_KEYS.all });
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to deduct stock");
    },
  });
}

export function useAdjustment(medicineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AdjustmentInput) => {
      const res = await apiClient.post(`/api/medicines/${medicineId}/movements`, {
        ...input,
        type: "ADJUSTMENT",
      });
      return res.data;
    },
    onSuccess: () => {
      notify.success("Stock adjusted successfully");
      queryClient.invalidateQueries({ queryKey: MEDICINE_KEYS.all });
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to adjust stock");
    },
  });
}
