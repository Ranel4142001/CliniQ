import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { UserRound } from "lucide-react";

interface PatientDetailPageProps {
  params: { id: string };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Details"
        description={`Patient ID: ${params.id}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: params.id },
        ]}
      />
      <EmptyState
        icon={<UserRound className="h-8 w-8" />}
        title="Patient detail view coming soon"
        description="Full patient profile, visit history, and clinical notes will be available in Phase 3."
      />
    </div>
  );
}
