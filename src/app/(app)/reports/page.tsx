import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and exportable clinic reports"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}
      />
      <EmptyState
        icon={<BarChart3 className="h-8 w-8" />}
        title="Reports & analytics coming soon"
        description="Consultation summaries, prescription volumes, and inventory reports will be available in Phase 3."
      />
    </div>
  );
}
