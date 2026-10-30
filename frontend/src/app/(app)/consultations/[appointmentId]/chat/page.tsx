"use client";

import React, { use } from "react";
import { MessageCircleOff } from "lucide-react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAppointment } from "@/features/appointments";
import { ConsultationChat } from "@/features/consultations";
import { formatDateTime } from "@/lib/date";
import { ROUTES } from "@/constants/routes";

/** Full-screen, Messenger-style chat for one online appointment. */
export default function ConsultationChatPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = use(params);
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: appointment, isLoading, error } = useAppointment(appointmentId);

  if (isLoading || userLoading) return <LoadingState message="Opening conversation…" />;

  if (error || !appointment || !user) {
    return (
      <ErrorState title="Conversation not found" message="This appointment could not be loaded." />
    );
  }

  const isPatient = user.role === "PATIENT";
  const isParticipant = isPatient || user.id === appointment.clinicianId;
  if (appointment.type !== "ONLINE" || !isParticipant) {
    return (
      <EmptyState
        icon={<MessageCircleOff className="h-6 w-6" />}
        title="Chat not available"
        description={
          appointment.type !== "ONLINE"
            ? "Chat is only available for online consultations."
            : "Only the patient and the assigned clinician can open this conversation."
        }
      />
    );
  }

  return (
    <div className="mx-auto h-[calc(100dvh-8rem)] min-h-[28rem] max-w-3xl sm:h-[calc(100dvh-10rem)]">
      <ConsultationChat
        variant="page"
        appointmentId={appointment.id}
        currentUser={{ id: user.id, fullName: user.fullName, role: user.role }}
        counterpartName={isPatient ? appointment.clinicianName : appointment.patientName}
        subtitle={`Online consultation · ${formatDateTime(appointment.scheduledAt)}`}
        meetingUrl={appointment.meetingUrl}
        scheduledAt={appointment.scheduledAt}
        backHref={isPatient ? ROUTES.APPOINTMENTS : ROUTES.CONSULTATION(appointment.id)}
      />
    </div>
  );
}
