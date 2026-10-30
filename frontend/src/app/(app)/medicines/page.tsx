"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  useMedicines,
  useMedicineAlerts,
  useUpdateMedicine,
} from "@/features/medicines/hooks/use-medicines";
import { MedicineTable } from "@/features/medicines/components/MedicineTable";
import { MedicineForm } from "@/features/medicines/components/MedicineForm";
import { BatchForm } from "@/features/medicines/components/BatchForm";
import { StockMovementDialog } from "@/features/medicines/components/StockMovementDialog";
import { MovementHistoryTable } from "@/features/medicines/components/MovementHistoryTable";
import { LowStockPanel } from "@/features/medicines/components/LowStockPanel";
import { ExpiringPanel } from "@/features/medicines/components/ExpiringPanel";
import { MedicineStats } from "@/features/medicines/components/MedicineStats";
import type { MedicineWithStock } from "@backend/contracts";

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [movementType, setMovementType] = useState<"STOCK_OUT" | "ADJUSTMENT">("STOCK_OUT");
  const [selectedMed, setSelectedMed] = useState<MedicineWithStock | null>(null);

  const { data, isLoading, error, refetch } = useMedicines({ search, page, pageSize: 10 });
  const { data: alerts } = useMedicineAlerts();
  const updateMutation = useUpdateMedicine(selectedMed?.id || "");

  const handleOpenAction = (
    med: MedicineWithStock,
    action: "in" | "out" | "adj" | "history" | "edit" | "archive"
  ) => {
    setSelectedMed(med);
    if (action === "in") setIsBatchOpen(true);
    if (action === "out") {
      setMovementType("STOCK_OUT");
      setIsMovementOpen(true);
    }
    if (action === "adj") {
      setMovementType("ADJUSTMENT");
      setIsMovementOpen(true);
    }
    if (action === "history") setIsHistoryOpen(true);
    if (action === "edit") setIsFormOpen(true);
    if (action === "archive") setIsArchiveOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicines & Stock Inventory"
        description="Catalog management, FEFO dispensing, batch tracking, and stock movements"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Medicines" }]}
        actions={
          <Button
            onClick={() => {
              setSelectedMed(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Medicine
          </Button>
        }
      />

      <MedicineStats
        totalMedicines={data?.meta?.total ?? 0}
        lowStockCount={alerts?.lowStock?.length ?? 0}
        expiringSoonCount={alerts?.expiringSoon?.length ?? 0}
        expiredCount={alerts?.expired?.length ?? 0}
      />

      {alerts &&
        (alerts.lowStock.length > 0 ||
          alerts.expiringSoon.length > 0 ||
          alerts.expired.length > 0) && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LowStockPanel
              medicines={alerts.lowStock}
              onStockIn={(m) => handleOpenAction(m, "in")}
            />
            <ExpiringPanel expiringSoon={alerts.expiringSoon} expired={alerts.expired} />
          </div>
        )}

      <MedicineTable
        medicines={data?.items}
        isLoading={isLoading}
        error={error as Error}
        onRetry={refetch}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onStockIn={(m) => handleOpenAction(m, "in")}
        onStockOut={(m) => handleOpenAction(m, "out")}
        onAdjust={(m) => handleOpenAction(m, "adj")}
        onViewHistory={(m) => handleOpenAction(m, "history")}
        onEdit={(m) => handleOpenAction(m, "edit")}
        onToggleArchive={(m) => handleOpenAction(m, "archive")}
        pagination={{
          page: data?.meta?.page ?? page,
          pageSize: data?.meta?.pageSize ?? 10,
          totalPages: data?.meta?.totalPages ?? 1,
          total: data?.meta?.total ?? 0,
          onPageChange: setPage,
        }}
      />

      <MedicineForm open={isFormOpen} onOpenChange={setIsFormOpen} medicine={selectedMed} />
      <BatchForm open={isBatchOpen} onOpenChange={setIsBatchOpen} medicine={selectedMed} />
      <StockMovementDialog
        open={isMovementOpen}
        onOpenChange={setIsMovementOpen}
        medicine={selectedMed}
        defaultType={movementType}
      />
      <MovementHistoryTable
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        medicineId={selectedMed?.id}
        medicineTitle={selectedMed ? `${selectedMed.name} ${selectedMed.strength}` : undefined}
      />
      <ConfirmDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        title={selectedMed?.isArchived ? "Unarchive Medicine" : "Archive Medicine"}
        description={
          selectedMed?.isArchived
            ? `Are you sure you want to restore ${selectedMed?.name} to active inventory?`
            : `Are you sure you want to archive ${selectedMed?.name}? Archived medicines cannot be prescribed or receive stock.`
        }
        confirmLabel={selectedMed?.isArchived ? "Unarchive" : "Archive"}
        onConfirm={async () => {
          if (selectedMed) {
            await updateMutation.mutateAsync({ isArchived: !selectedMed.isArchived });
            setIsArchiveOpen(false);
          }
        }}
      />
    </div>
  );
}
