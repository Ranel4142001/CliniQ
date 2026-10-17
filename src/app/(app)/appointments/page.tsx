import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Calendar } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Schedule and manage patient appointments"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Appointments" }]}
      />
      <EmptyState
        icon={<Calendar className="h-8 w-8" />}
        title="Appointment scheduling coming soon"
        description="Calendar view, appointment booking, and status management will be implemented in Phase 3."
      />
    </div>
  );
}
