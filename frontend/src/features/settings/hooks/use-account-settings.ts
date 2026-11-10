"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { QUERY_KEYS } from "@/constants/query-keys";
import type {
  ChangeEmailInput,
  ChangePasswordInput,
  UpdateOwnProfileInput,
  UserProfile,
} from "@backend/contracts";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

export function useUpdateOwnProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateOwnProfileInput) =>
      (await apiClient.patch<UserProfile>("/api/me", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER });
      notify.success("Name updated");
    },
    onError: (error) => notify.error("Could not update your name", errorMessage(error)),
  });
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: async (input: ChangeEmailInput) =>
      (await apiClient.post<{ pendingEmail: string }>("/api/me/email", input)).data,
    onSuccess: ({ pendingEmail }) =>
      notify.success("Check your inbox", `We sent a confirmation link to ${pendingEmail}.`),
    onError: (error) => notify.error("Could not change your email", errorMessage(error)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) =>
      (await apiClient.post<{ success: boolean }>("/api/me/password", input)).data,
    onSuccess: () =>
      notify.success("Password changed", "Use your new password next time you sign in."),
    onError: (error) => notify.error("Could not change your password", errorMessage(error)),
  });
}
