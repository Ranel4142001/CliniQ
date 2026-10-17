import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Package } from "lucide-react";

export default function MedicinesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicines"
        description="Manage medicine inventory and stock levels"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Medicines" }]}
      />
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="Medicine inventory coming soon"
        description="Medicine catalog, stock tracking, and reorder management will be implemented in Phase 3."
      />
    </div>
  );
}
