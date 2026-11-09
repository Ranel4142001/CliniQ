"use client";

import React from "react";
import { ROUTES } from "@/constants/routes";
import type { ChatParticipant } from "@backend/contracts";
import { ChatHeader } from "@/features/consultations/components/chat/ChatHeader";
import { ChatPanel, type ChatPanelVariant } from "@/features/consultations/components/chat/ChatPanel";
import {
  useConsultationChat,
  useMarkChatRead,
  useSendChatMessage,
  useTypingPing,
} from "@/features/consultations/hooks/useConsultationChat";

interface ConsultationChatProps {
  appointmentId: string;
  currentUser: ChatParticipant;
  counterpartName: string;
  /** Line under the name, e.g. the visit date. */
  subtitle?: string;
  meetingUrl?: string | null;
  scheduledAt?: string | Date;
  variant?: ChatPanelVariant;
  backHref?: string;
  backClassName?: string;
  className?: string;
}

/** Messenger-style chat between the patient and clinician of an online appointment. */
export function ConsultationChat({
  appointmentId,
  currentUser,
  counterpartName,
  subtitle = "Online consultation",
  meetingUrl,
  scheduledAt,
  variant = "panel",
  backHref,
  backClassName,
  className,
}: ConsultationChatProps) {
  const { data, isLoading, error, refetch } = useConsultationChat(appointmentId);
  const sendMutation = useSendChatMessage(appointmentId, currentUser);
  const pingTyping = useTypingPing(appointmentId);
  const messages = data?.messages ?? [];

  useMarkChatRead(appointmentId, messages, currentUser.id);

  return (
    <ChatPanel
      variant={variant}
      className={className}
      header={
        <ChatHeader
          counterpartName={counterpartName}
          subtitle={subtitle}
          status={data?.counterpart}
          meetingUrl={meetingUrl}
          scheduledAt={scheduledAt}
          backHref={variant === "panel" ? undefined : backHref}
          backClassName={backClassName}
          expandHref={variant === "panel" ? ROUTES.MESSAGE_THREAD(appointmentId) : undefined}
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
      onTyping={pingTyping}
      isCounterpartTyping={data?.counterpart.isTyping ?? false}
    />
  );
}
