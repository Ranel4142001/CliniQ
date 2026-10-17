import { PageHeader } from "@/shared/components/layout/PageHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Stethoscope } from "lucide-react";

interface ConsultationPageProps {
  params: { appointmentId: string };
}

export default function ConsultationPage({ params }: ConsultationPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation"
        description={`Appointment: ${params.appointmentId}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Appointments", href: "/appointments" },
          { label: "Consultation" },
        ]}
      />
      <EmptyState
        icon={<Stethoscope className="h-8 w-8" />}
        title="Consultation form coming soon"
        description="SOAP notes, vital signs, diagnosis, and prescription issuance will be implemented in Phase 3."
      />
    </div>
  );
}
