"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ROUTES } from "@/constants/routes";
import type { ChatParticipant } from "@backend/contracts";
import { ChatComposer } from "@/features/consultations/components/chat/ChatComposer";
import { ChatHeader } from "@/features/consultations/components/chat/ChatHeader";
import { ChatMessageList } from "@/features/consultations/components/chat/ChatMessageList";
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
  /**
   * "panel": fixed-height box inside a page. "page": fills its container (full-screen chat).
   * "inbox": borderless, fills the right pane of the Messages page.
   */
  variant?: "panel" | "page" | "inbox";
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
    <section
      aria-label={`Chat with ${counterpartName}`}
      className={cn(
        "flex flex-col overflow-hidden bg-card",
        variant === "panel" && "h-[520px] rounded-xl border shadow-sm",
        variant === "page" && "h-full rounded-2xl border shadow-lg shadow-primary/5",
        variant === "inbox" && "h-full",
        className
      )}
    >
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
        <ChatMessageList
          messages={messages}
          currentUserId={currentUser.id}
          counterpartName={counterpartName}
          isCounterpartTyping={data?.counterpart.isTyping ?? false}
        />
      )}

      {data && (
        <ChatComposer
          canSend={data.canSend}
          onSend={(body) => sendMutation.mutate(body)}
          onTyping={pingTyping}
        />
      )}
    </section>
  );
}
