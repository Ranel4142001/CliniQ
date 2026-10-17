import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Users } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="View and manage patient records"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patients" }]}
      />
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="Patient records coming soon"
        description="Patient registration, medical history, and record management will be implemented in Phase 3."
      />
    </div>
  );
}
