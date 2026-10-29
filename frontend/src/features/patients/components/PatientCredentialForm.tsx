"use client";

import React, { useMemo } from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { createPatientSchema, editPatientSchema } from "@backend/contracts";
import type { PatientDTO } from "@backend/contracts";
import { PatientPersonalSection } from "@/features/patients/components/form-sections/PatientPersonalSection";
import { PatientContactSection } from "@/features/patients/components/form-sections/PatientContactSection";
import { PatientGuardianSection } from "@/features/patients/components/form-sections/PatientGuardianSection";
import { PatientHealthSection } from "@/features/patients/components/form-sections/PatientHealthSection";
import { PatientConsentSection } from "@/features/patients/components/form-sections/PatientConsentSection";
import type { Role } from "@prisma/client";

export interface PatientFormValues {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string;
  sex: "MALE" | "FEMALE";
  contactNumber: string;
  address: string;
  guardianName?: string;
  guardianContact?: string;
  emergencyName: string;
  emergencyContact: string;
  bloodType?: string;
  allergies?: string;
  existingConditions?: string;
  consentGiven: boolean;
}

export interface PatientCredentialFormProps {
  mode: "self-register" | "staff-create" | "edit";
  initialData?: PatientDTO;
  userRole?: Role;
  onSubmit: (data: PatientFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function PatientCredentialForm({
  mode,
  initialData,
  userRole,
  onSubmit,
  onCancel,
  isSubmitting,
}: PatientCredentialFormProps) {
  const schema = mode === "edit" ? editPatientSchema : createPatientSchema;

  const defaultValues = useMemo<PatientFormValues>(() => {
    return {
      firstName: initialData?.firstName ?? "",
      middleName: initialData?.middleName ?? "",
      lastName: initialData?.lastName ?? "",
      birthDate: initialData?.birthDate ?? "",
      sex: (initialData?.sex as "MALE" | "FEMALE") ?? "MALE",
      contactNumber: initialData?.contactNumber ?? "",
      address: initialData?.address ?? "",
      guardianName: initialData?.guardianName ?? "",
      guardianContact: initialData?.guardianContact ?? "",
      emergencyName: initialData?.emergencyName ?? "",
      emergencyContact: initialData?.emergencyContact ?? "",
      bloodType: initialData?.bloodType ?? "",
      allergies: initialData?.allergies ?? "",
      existingConditions: initialData?.existingConditions ?? "",
      consentGiven: mode === "edit" ? true : false,
    };
  }, [initialData, mode]);

  const methods = useForm<PatientFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<PatientFormValues>,
    defaultValues,
  });

  const watchedBirthDate = methods.watch("birthDate");

  const isUnder18 = useMemo(() => {
    if (!watchedBirthDate) return false;
    const birth = new Date(watchedBirthDate);
    if (isNaN(birth.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age < 18;
  }, [watchedBirthDate]);

  const isPatientSelfEditing = mode === "edit" && userRole === "PATIENT";

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <PatientPersonalSection disabled={isPatientSelfEditing} />
        <PatientContactSection />
        <PatientGuardianSection
          isVisible={isUnder18}
          disabled={isPatientSelfEditing}
        />
        <PatientHealthSection disabledConditions={isPatientSelfEditing} />
        <PatientConsentSection
          mode={mode}
          consentGivenAt={initialData?.consentGivenAt}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
              ? "Save Changes"
              : "Register Patient"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
