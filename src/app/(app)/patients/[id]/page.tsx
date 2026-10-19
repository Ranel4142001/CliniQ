"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { ErrorState } from "@/shared/components/feedback/ErrorState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  usePatient,
  useUpdatePatient,
  PatientProfileCard,
  PatientHistoryTabs,
  PatientCredentialForm,
  EditPatientInput,
  PatientFormValues,
} from "@/features/patients";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface PatientDetailPageProps {
  params: { id: string };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = params;
  const { user } = useCurrentUser();
  const { data: patient, isLoading, error, refetch } = usePatient(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const updateMutation = useUpdatePatient();

  const handleUpdate = async (formData: PatientFormValues) => {
    await updateMutation.mutateAsync({
      id,
      data: formData as unknown as EditPatientInput,
    });
    setIsEditOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <ErrorState
        title="Patient not found"
        message={error?.message || "The requested patient record could not be loaded."}
        onRetry={refetch}
      />
    );
  }

  const canEdit =
    user?.role === "ADMIN" ||
    user?.role === "STAFF" ||
    (user?.role === "PATIENT" && user?.id === patient.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.fullName}
        description={`Record No. ${patient.patientNo}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: patient.patientNo },
        ]}
      />

      <PatientProfileCard
        patient={patient}
        canEdit={canEdit}
        onEdit={() => setIsEditOpen(true)}
      />

      <div className="space-y-3 pt-2">
        <h3 className="text-base font-semibold text-foreground">Clinical History</h3>
        <PatientHistoryTabs patientId={patient.id} />
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Record</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <PatientCredentialForm
              mode="edit"
              initialData={patient}
              userRole={user?.role}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditOpen(false)}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
