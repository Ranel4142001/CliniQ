"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  usePatients,
  useCreatePatient,
  useArchivePatient,
  PatientTable,
  PatientCredentialForm,
  CreatePatientInput,
  PatientFormValues,
} from "@/features/patients";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useDebounce } from "@/shared/hooks/useDebounce";

export default function PatientsPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePatients({
    page,
    pageSize: 15,
    search: debouncedSearch,
  });

  const createPatientMutation = useCreatePatient();
  const archivePatientMutation = useArchivePatient();

  const handleCreatePatient = async (formData: PatientFormValues) => {
    await createPatientMutation.mutateAsync(formData as unknown as CreatePatientInput);
    setIsRegisterOpen(false);
  };

  const handleArchive = async (id: string) => {
    await archivePatientMutation.mutateAsync(id);
  };

  const canManage = user?.role === "ADMIN" || user?.role === "STAFF";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Register and manage clinic patient records"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patients" }]}
        actions={
          canManage ? (
            <Button onClick={() => setIsRegisterOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" /> Register Patient
            </Button>
          ) : undefined
        }
      />

      <PatientTable
        data={data?.items ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        page={page}
        pageSize={15}
        total={data?.meta?.total ?? 0}
        totalPages={data?.meta?.totalPages ?? 1}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        onArchive={handleArchive}
        canArchive={canManage}
      />

      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <PatientCredentialForm
              mode="staff-create"
              userRole={user?.role}
              onSubmit={handleCreatePatient}
              onCancel={() => setIsRegisterOpen(false)}
              isSubmitting={createPatientMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
