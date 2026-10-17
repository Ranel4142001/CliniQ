import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { FileText } from "lucide-react";

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description="View and manage issued prescriptions"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Prescriptions" }]}
      />
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Prescription management coming soon"
        description="Prescription list, PDF export (RX-YYYY-NNNN), and dispensing tracking will be implemented in Phase 3."
      />
    </div>
  );
}
