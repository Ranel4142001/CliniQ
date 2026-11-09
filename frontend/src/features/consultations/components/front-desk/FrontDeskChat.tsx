"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { ROLES, type ChatParticipant } from "@backend/contracts";
import { ROUTES } from "@/constants/routes";
import { ChatHeader } from "@/features/consultations/components/chat/ChatHeader";
import { ChatPanel } from "@/features/consultations/components/chat/ChatPanel";
import {
  useFrontDeskChat,
  useMarkFrontDeskRead,
  useSendFrontDeskMessage,
} from "@/features/consultations/hooks/useFrontDesk";

/** What the patient sees as the other side of the thread. */
export const FRONT_DESK_NAME = "Clinic front desk";
const PATIENT_HINT =
  "Ask about bookings, payments or medicine pickups. Clinic staff reply here. For medical questions, message your doctor.";
const DESK_HINT = "Shared with all clinic staff. Say hello 👋";
const NO_ACCOUNT_REASON = "This patient has no CliniQ account yet, so they can't receive messages.";

interface FrontDeskChatProps {
  patientId: string;
  currentUser: ChatParticipant;
}

/** A patient's thread with the clinic: one shared conversation for all admins and staff. */
export function FrontDeskChat({ patientId, currentUser }: FrontDeskChatProps) {
  const viewerIsPatient = currentUser.role === ROLES.PATIENT;
  const { data, isLoading, error, refetch } = useFrontDeskChat(patientId);
  const sendMutation = useSendFrontDeskMessage(patientId, currentUser);
  const messages = data?.messages ?? [];

  useMarkFrontDeskRead(patientId, messages, viewerIsPatient);

  const counterpartName = viewerIsPatient ? FRONT_DESK_NAME : (data?.patientName ?? "Patient");
  const subtitle = viewerIsPatient
    ? "Clinic staff · bookings, payments, pickups"
    : `${data?.patientNo ?? ""} · Front-desk conversation`;

  return (
    <ChatPanel
      variant="inbox"
      header={
        <ChatHeader
          counterpartName={counterpartName}
          subtitle={subtitle}
          backHref={ROUTES.MESSAGES}
          backClassName="md:hidden"
          avatarIcon={viewerIsPatient ? <Building2 className="h-5 w-5" /> : undefined}
        />
      }
      counterpartName={counterpartName}
      currentUserId={currentUser.id}
      messages={messages}
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      canSend={data?.canSend}
      onSend={(body) => sendMutation.mutate(body)}
      emptyHint={viewerIsPatient ? PATIENT_HINT : DESK_HINT}
      readOnlyReason={NO_ACCOUNT_REASON}
    />
  );
}
