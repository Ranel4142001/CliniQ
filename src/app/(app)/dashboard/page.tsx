import { PageHeader } from "@/shared/components/layout/PageHeader";
import { StatCard } from "@/shared/components/layout/StatCard";
import { Users, Calendar, FileText, Package } from "lucide-react";

/**
 * Dashboard overview page – shows high-level clinic stats.
 * Data will be wired to real API calls in Phase 3+.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of clinic activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="—"
          icon={<Users className="h-4 w-4" />}
          description="Registered patients"
        />
        <StatCard
          title="Today's Appointments"
          value="—"
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
        />
        <StatCard
          title="Prescriptions"
          value="—"
          icon={<FileText className="h-4 w-4" />}
          description="Issued this month"
        />
        <StatCard
          title="Medicines in Stock"
          value="—"
          icon={<Package className="h-4 w-4" />}
          description="Active inventory items"
        />
      </div>

      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        Detailed charts and analytics will be added in Phase 3.
      </div>
    </div>
  );
}
