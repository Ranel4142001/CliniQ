"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { notify } from "@/shared/lib/notify";
import type {
  ConsultationWithRelations,
  StartConsultationInput,
  UpdateConsultationInput,
  CompleteConsultationInput,
} from "@/features/consultations";

const CONSULTATION_KEYS = {
  all: ["consultations"] as const,
  lists: () => [...CONSULTATION_KEYS.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...CONSULTATION_KEYS.lists(), params] as const,
  details: () => [...CONSULTATION_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CONSULTATION_KEYS.details(), id] as const,
  byAppointment: (appointmentId: string) =>
    [...CONSULTATION_KEYS.all, "appointment", appointmentId] as const,
};

export function useConsultation(id?: string) {
  return useQuery({
    queryKey: CONSULTATION_KEYS.detail(id || ""),
    queryFn: async () => {
      const res = await apiClient.get<ConsultationWithRelations>(`/api/consultations/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useConsultationByAppointment(appointmentId?: string) {
  return useQuery({
    queryKey: CONSULTATION_KEYS.byAppointment(appointmentId || ""),
    queryFn: async () => {
      const res = await apiClient.get<ConsultationWithRelations | null>(
        `/api/consultations?appointmentId=${appointmentId}`
      );
      return res.data;
    },
    enabled: Boolean(appointmentId),
  });
}

export function useConsultations(params: { page?: number; pageSize?: number; patientId?: string } = {}) {
  return useQuery({
    queryKey: CONSULTATION_KEYS.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ConsultationWithRelations[]>("/api/consultations", {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          patientId: params.patientId,
        },
      });
      return res;
    },
  });
}

export function useStartConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartConsultationInput) => {
      const res = await apiClient.post<ConsultationWithRelations>("/api/consultations", input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Consultation started");
      queryClient.invalidateQueries({ queryKey: CONSULTATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.setQueryData(CONSULTATION_KEYS.detail(data.id), data);
      queryClient.setQueryData(CONSULTATION_KEYS.byAppointment(data.appointmentId), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to start consultation");
    },
  });
}

export function useUpdateConsultation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateConsultationInput) => {
      const res = await apiClient.patch<ConsultationWithRelations>(`/api/consultations/${id}`, input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Consultation notes saved");
      queryClient.setQueryData(CONSULTATION_KEYS.detail(id), data);
      queryClient.setQueryData(CONSULTATION_KEYS.byAppointment(data.appointmentId), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to save consultation");
    },
  });
}

export function useCompleteConsultation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CompleteConsultationInput) => {
      const res = await apiClient.post<ConsultationWithRelations>(`/api/consultations/${id}/complete`, input);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success("Consultation completed successfully!");
      queryClient.invalidateQueries({ queryKey: CONSULTATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.setQueryData(CONSULTATION_KEYS.detail(id), data);
      queryClient.setQueryData(CONSULTATION_KEYS.byAppointment(data.appointmentId), data);
    },
    onError: (err: Error) => {
      notify.error(err.message || "Failed to complete consultation");
    },
  });
}
