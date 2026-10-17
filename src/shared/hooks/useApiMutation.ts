"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { notify } from "../lib/notify";
import { AppError } from "../lib/errors";

export interface ApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, unknown, TVariables, unknown>, "mutationFn" | "onSuccess" | "onError"> {
  invalidateQueries?: readonly (readonly unknown[])[];
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: unknown) => string);
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables) => void;
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: ApiMutationOptions<TData, TVariables> = {}
) {
  const queryClient = useQueryClient();
  const { invalidateQueries, successMessage, errorMessage, onSuccess, onError, ...rest } = options;

  return useMutation<TData, unknown, TVariables, unknown>({
    mutationFn,
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        for (const queryKey of invalidateQueries) {
          queryClient.invalidateQueries({ queryKey });
        }
      }

      if (successMessage) {
        const msg = typeof successMessage === "function" ? successMessage(data) : successMessage;
        notify.success(msg);
      }

      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      if (errorMessage) {
        const msg = typeof errorMessage === "function" ? errorMessage(error) : errorMessage;
        notify.error(msg);
      } else if (error instanceof AppError) {
        notify.error(error.message);
      } else if (error instanceof Error) {
        notify.error(error.message);
      } else {
        notify.error("An unexpected error occurred");
      }

      onError?.(error, variables);
    },
    ...rest,
  });
}
