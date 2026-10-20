"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import {
  usePrescriptions,
  usePrescriptionStats,
  useIssuePrescription,
  useDispensePrescription,
} from "@/features/prescriptions/hooks/use-prescriptions";
import { PrescriptionTable } from "@/features/prescriptions/components/PrescriptionTable";
import { PrescriptionForm } from "@/features/prescriptions/components/PrescriptionForm";
import { PrescriptionDetail } from "@/features/prescriptions/components/PrescriptionDetail";
import { VoidPrescriptionDialog } from "@/features/prescriptions/components/VoidPrescriptionDialog";
import { PrescriptionStats } from "@/features/prescriptions/components/PrescriptionStats";
import type { PrescriptionWithRelations } from "@/features/prescriptions/types/prescription.types";

export default function PrescriptionsPage() {
  const searchParams = useSearchParams();
  const newForConsultationId = searchParams.get("newFor");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [formConsultationId, setFormConsultationId] = useState<string | undefined>(undefined);
  const [selectedRx, setSelectedRx] = useState<PrescriptionWithRelations | null>(null);

  // If navigated from consultation page with ?newFor=<consultationId>, open form immediately
  useEffect(() => {
    if (newForConsultationId) {
      setFormConsultationId(newForConsultationId);
      setSelectedRx(null);
      setIsFormOpen(true);
    }
  }, [newForConsultationId]);

  const { data, isLoading, error, refetch } = usePrescriptions({ search, page, pageSize: 10 });
  const { data: stats } = usePrescriptionStats();

  const issueMutation = useIssuePrescription(selectedRx?.id || "");
  const dispenseMutation = useDispensePrescription(selectedRx?.id || "");

  const handleOpenAction = (rx: PrescriptionWithRelations, action: "view" | "edit" | "issue" | "dispense" | "void") => {
    setSelectedRx(rx);
    if (action === "view") setIsDetailOpen(true);
    if (action === "edit") { setFormConsultationId(undefined); setIsFormOpen(true); }
    if (action === "issue") issueMutation.mutate();
    if (action === "dispense") dispenseMutation.mutate();
    if (action === "void") setIsVoidOpen(true);
  };

  const handleNewPrescription = () => {
    setSelectedRx(null);
    setFormConsultationId(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Prescriptions"
        description="Prescription lifecycle (Draft ➔ Issued ➔ Dispensed), PDF generation, and FEFO stock integration"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Prescriptions" }]}
        actions={
          <Button onClick={handleNewPrescription}>
            <Plus className="mr-2 h-4 w-4" /> New Prescription
          </Button>
        }
      />

      <PrescriptionStats stats={stats} />

      <PrescriptionTable
        prescriptions={data?.items}
        isLoading={isLoading}
        error={error as Error}
        onRetry={refetch}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onView={(rx) => handleOpenAction(rx, "view")}
        onEdit={(rx) => handleOpenAction(rx, "edit")}
        onIssue={(rx) => handleOpenAction(rx, "issue")}
        onDispense={(rx) => handleOpenAction(rx, "dispense")}
        onVoid={(rx) => handleOpenAction(rx, "void")}
        pagination={{
          page: data?.meta?.page ?? page,
          pageSize: data?.meta?.pageSize ?? 10,
          totalPages: data?.meta?.totalPages ?? 1,
          total: data?.meta?.total ?? 0,
          onPageChange: setPage,
        }}
      />

      <PrescriptionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setFormConsultationId(undefined);
        }}
        consultationId={formConsultationId}
        prescription={selectedRx && !formConsultationId ? selectedRx : null}
      />

      <PrescriptionDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        prescription={selectedRx}
        onEdit={(rx) => { setIsDetailOpen(false); handleOpenAction(rx, "edit"); }}
        onVoidClick={(rx) => { setIsDetailOpen(false); handleOpenAction(rx, "void"); }}
      />

      {selectedRx && (
        <VoidPrescriptionDialog
          open={isVoidOpen}
          onOpenChange={setIsVoidOpen}
          prescriptionId={selectedRx.id}
          prescriptionNo={selectedRx.prescriptionNo}
        />
      )}
    </div>
  );
}
