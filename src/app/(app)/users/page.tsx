import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Users } from "lucide-react";

/**
 * Users management page.
 * Admin-only – will be wired to the users API in Phase 3.
 */
export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage clinic staff and patient accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
      />

      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="User management coming soon"
        description="Full user listing, role assignment, and account activation will be available in Phase 3."
      />
    </div>
  );
}
