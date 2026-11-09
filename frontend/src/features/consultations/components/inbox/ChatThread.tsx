"use client";

import React from "react";
import { MessageCircleOff } from "lucide-react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAppointment } from "@/features/appointments";
import { ConsultationChat } from "@/features/consultations/components/chat/ConsultationChat";
import { formatDateTime } from "@/lib/date";
import { ROUTES } from "@/constants/routes";

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center p-4">{children}</div>;
}

/** Right pane of the Messages page: the conversation for one online appointment. */
export function ChatThread({ appointmentId }: { appointmentId: string }) {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: appointment, isLoading, error } = useAppointment(appointmentId);

  if (isLoading || userLoading) return <LoadingState message="Opening conversation…" className="h-full" />;

  if (error || !appointment || !user) {
    return (
      <Centered>
        <ErrorState title="Conversation not found" message="This appointment could not be loaded." />
      </Centered>
    );
  }

  const isPatient = user.role === "PATIENT";
  const isParticipant = isPatient || user.id === appointment.clinicianId;
  if (appointment.type !== "ONLINE" || !isParticipant) {
    return (
      <Centered>
        <EmptyState
          icon={<MessageCircleOff className="h-6 w-6" />}
          title="Chat not available"
          description={
            appointment.type !== "ONLINE"
              ? "Chat is only available for online consultations."
              : "Only the patient and the assigned clinician can open this conversation."
          }
        />
      </Centered>
    );
  }

  return (
    <ConsultationChat
      key={appointment.id}
      variant="inbox"
      appointmentId={appointment.id}
      currentUser={{ id: user.id, fullName: user.fullName, role: user.role }}
      counterpartName={isPatient ? appointment.clinicianName : appointment.patientName}
      subtitle={`Online consultation · ${formatDateTime(appointment.scheduledAt)}`}
      meetingUrl={appointment.meetingUrl}
      scheduledAt={appointment.scheduledAt}
      backHref={ROUTES.MESSAGES}
      backClassName="md:hidden"
    />
  );
}
