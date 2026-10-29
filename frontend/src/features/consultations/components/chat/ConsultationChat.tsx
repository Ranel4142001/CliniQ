"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getInitials } from "@/lib/format";
import type { ChatParticipant } from "@backend/contracts";
import { ChatComposer } from "@/features/consultations/components/chat/ChatComposer";
import { ChatMessageList } from "@/features/consultations/components/chat/ChatMessageList";
import { useConsultationChat, useMarkChatRead, useSendChatMessage } from "@/features/consultations/hooks/useConsultationChat";

interface ConsultationChatProps {
  appointmentId: string;
  currentUser: ChatParticipant;
  counterpartName: string;
  className?: string;
}

/** Messenger-style chat between the patient and clinician of an online appointment. */
export function ConsultationChat({ appointmentId, currentUser, counterpartName, className = "" }: ConsultationChatProps) {
  const { data, isLoading, error, refetch } = useConsultationChat(appointmentId);
  const sendMutation = useSendChatMessage(appointmentId, currentUser);
  const messages = data?.messages ?? [];

  useMarkChatRead(appointmentId, messages, currentUser.id);

  return (
    <section
      aria-label="Consultation chat"
      className={`flex h-[520px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm ${className}`}
    >
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {getInitials(counterpartName)}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-foreground">{counterpartName}</h4>
          <p className="text-xs text-muted-foreground">Online consultation chat</p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading messages" />
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center p-4">
          <ErrorState
            title="Chat unavailable"
            message={error instanceof Error ? error.message : "Messages could not be loaded."}
            onRetry={() => refetch()}
          />
        </div>
      ) : (
        <ChatMessageList messages={messages} currentUserId={currentUser.id} counterpartName={counterpartName} />
      )}

      {data && <ChatComposer canSend={data.canSend} onSend={(body) => sendMutation.mutate(body)} />}
    </section>
  );
}
