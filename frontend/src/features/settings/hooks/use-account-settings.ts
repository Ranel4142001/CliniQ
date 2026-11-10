"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AccountChanges } from "@/features/settings/utils/account-form";

export interface SaveResult {
  savedName: boolean;
  pendingEmail: string | null;
  changedPassword: boolean;
}

/** Applies each changed part in turn; stops at the first failure so nothing is half-explained. */
async function saveAccount(changes: AccountChanges): Promise<SaveResult> {
  const result: SaveResult = { savedName: false, pendingEmail: null, changedPassword: false };
  if (changes.fullName) {
    await apiClient.patch("/api/me", { fullName: changes.fullName });
    result.savedName = true;
  }
  if (changes.newEmail) {
    await apiClient.post("/api/me/email", {
      newEmail: changes.newEmail,
      currentPassword: changes.currentPassword,
    });
    result.pendingEmail = changes.newEmail;
  }
  if (changes.newPassword) {
    await apiClient.post("/api/me/password", {
      currentPassword: changes.currentPassword,
      newPassword: changes.newPassword,
      confirmPassword: changes.newPassword,
    });
    result.changedPassword = true;
  }
  return result;
}

function successMessage({ savedName, pendingEmail, changedPassword }: SaveResult): string {
  const parts = [
    savedName && "Name updated.",
    changedPassword && "Password changed.",
    pendingEmail && `Open the link we sent to ${pendingEmail} to confirm your new email.`,
  ].filter(Boolean);
  return parts.join(" ");
}

export function useSaveAccountSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAccount,
    onSuccess: (result) => notify.success("Changes saved", successMessage(result)),
    onError: (error) =>
      notify.error(
        "Could not save all changes",
        error instanceof Error ? error.message : "Please try again."
      ),
    // A name saved before a later step failed should still show up.
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER }),
  });
}
