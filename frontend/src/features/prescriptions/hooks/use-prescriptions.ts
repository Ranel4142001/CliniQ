"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import type {
  PrescriptionWithRelations,
  PrescriptionStatsDTO,
} from "@backend/contracts";
import type {
  CreatePrescriptionInput,
  UpdatePrescriptionInput,
  VoidPrescriptionInput,
  ListPrescriptionsInput,
} from "@backend/contracts";

export const PRESCRIPTION_KEYS = {
  all: ["prescriptions"] as const,
  lists: () => [...PRESCRIPTION_KEYS.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...PRESCRIPTION_KEYS.lists(), params] as const,
  details: () => [...PRESCRIPTION_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PRESCRIPTION_KEYS.details(), id] as const,
  stats: () => [...PRESCRIPTION_KEYS.all, "stats"] as const,
};

export function usePrescriptions(params: Partial<ListPrescriptionsInput> = {}) {
  return useQuery({
    queryKey: PRESCRIPTION_KEYS.list(params),
    queryFn: async () => {
      const res = await apiClient.get<PrescriptionWithRelations[]>("/api/prescriptions", {
        params: {
          patientId: params.patientId,
          consultationId: params.consultationId,
          status: params.status,
          search: params.search,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      });
      return {
        items: res.data ?? [],
        meta: res.meta,
      };
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}

export function usePrescription(id?: string) {
  return useQuery({
    queryKey: PRESCRIPTION_KEYS.detail(id || ""),
    queryFn: async () => {
      const res = await apiClient.get<PrescriptionWithRelations>(`/api/prescriptions/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

export function usePrescriptionStats() {
  return useQuery({
    queryKey: PRESCRIPTION_KEYS.stats(),
    queryFn: async () => {
      const res = await apiClient.get<PrescriptionStatsDTO>("/api/prescriptions/stats");
      return res.data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrescriptionInput) => {
      const res = await apiClient.post<PrescriptionWithRelations>("/api/prescriptions", input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Prescription draft created");
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
      queryClient.setQueryData(PRESCRIPTION_KEYS.detail(data.id), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to create prescription");
    },
  });
}

export function useUpdatePrescription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePrescriptionInput) => {
      const res = await apiClient.patch<PrescriptionWithRelations>(`/api/prescriptions/${id}`, input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Prescription draft updated");
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
      queryClient.setQueryData(PRESCRIPTION_KEYS.detail(id), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to update prescription");
    },
  });
}

export function useIssuePrescription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<PrescriptionWithRelations>(`/api/prescriptions/${id}/issue`);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success(`Prescription issued #${data.prescriptionNo}`);
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
      queryClient.setQueryData(PRESCRIPTION_KEYS.detail(id), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to issue prescription");
    },
  });
}

export function useDispensePrescription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<PrescriptionWithRelations>(`/api/prescriptions/${id}/dispense`);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success(`Prescription dispensed & inventory updated`);
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.setQueryData(PRESCRIPTION_KEYS.detail(id), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to dispense prescription");
    },
  });
}

export function useVoidPrescription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VoidPrescriptionInput) => {
      const res = await apiClient.post<PrescriptionWithRelations>(`/api/prescriptions/${id}/void`, input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Prescription marked as VOID");
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.all });
      queryClient.setQueryData(PRESCRIPTION_KEYS.detail(id), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to void prescription");
    },
  });
}
