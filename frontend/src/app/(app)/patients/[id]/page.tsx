"use client";

import React, { use, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  usePatient,
  useUpdatePatient,
  PatientProfileCard,
  PatientHistoryTabs,
  PatientCredentialForm,
  PatientFormValues,
} from "@/features/patients";
import type { EditPatientInput } from "@backend/contracts";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params);
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

      <PatientProfileCard patient={patient} canEdit={canEdit} onEdit={() => setIsEditOpen(true)} />

      <div className="space-y-3 pt-2">
        <h3 className="text-base font-semibold text-foreground">Clinical History</h3>
        <PatientHistoryTabs patientId={patient.id} />
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
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
