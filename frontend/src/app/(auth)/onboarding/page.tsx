"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { PatientCredentialForm, useCreatePatient, PatientFormValues } from "@/features/patients";
import type { CreatePatientInput } from "@backend/contracts";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ROUTES } from "@/constants/routes";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const createPatientMutation = useCreatePatient();

  useEffect(() => {
    // If the user already has a linked patient record, they don't need onboarding
    if (user?.patient) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, router]);

  const handleSubmit = async (formData: PatientFormValues) => {
    await createPatientMutation.mutateAsync(formData as unknown as CreatePatientInput);
    router.push(ROUTES.DASHBOARD);
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Checking account status..." />
      </div>
    );
  }

  return (
    <div data-wide="true" className="space-y-6">
      <div className="space-y-1 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Complete Patient Credential Form
        </h1>
        <p className="mx-auto max-w-md text-xs text-muted-foreground">
          Please provide your personal and emergency details to complete your clinic profile before
          booking appointments or accessing medical records.
        </p>
      </div>

      <div className="pt-2">
        <PatientCredentialForm
          mode="self-register"
          userRole={user?.role}
          onSubmit={handleSubmit}
          isSubmitting={createPatientMutation.isPending}
        />
      </div>
    </div>
  );
}
