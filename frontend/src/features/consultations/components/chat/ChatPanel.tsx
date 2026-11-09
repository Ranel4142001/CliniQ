"use client";

import React, { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ChatComposer } from "@/features/consultations/components/chat/ChatComposer";
import { ChatMessageList } from "@/features/consultations/components/chat/ChatMessageList";
import type { ChatMessageView } from "@/features/consultations/utils/group-messages";

export type ChatPanelVariant = "panel" | "page" | "inbox";

interface ChatPanelProps {
  header: ReactNode;
  counterpartName: string;
  currentUserId: string;
  messages: ChatMessageView[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  /** Undefined while the thread is loading: no composer yet. */
  canSend?: boolean;
  onSend: (body: string) => void;
  onTyping?: () => void;
  isCounterpartTyping?: boolean;
  emptyHint?: string;
  readOnlyReason?: string;
  /**
   * "panel": fixed-height box inside a page. "page": fills its container (full-screen chat).
   * "inbox": borderless, fills the right pane of the Messages page.
   */
  variant?: ChatPanelVariant;
  className?: string;
}

/** Messenger-style chat window: header, message list (with loading/error states) and composer. */
export function ChatPanel({
  header,
  counterpartName,
  currentUserId,
  messages,
  isLoading,
  error,
  onRetry,
  canSend,
  onSend,
  onTyping,
  isCounterpartTyping = false,
  emptyHint,
  readOnlyReason,
  variant = "panel",
  className,
}: ChatPanelProps) {
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
      {header}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading messages" />
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center p-4">
          <ErrorState
            title="Chat unavailable"
            message={error instanceof Error ? error.message : "Messages could not be loaded."}
            onRetry={onRetry}
          />
        </div>
      ) : (
        <ChatMessageList
          messages={messages}
          currentUserId={currentUserId}
          counterpartName={counterpartName}
          isCounterpartTyping={isCounterpartTyping}
          emptyHint={emptyHint}
        />
      )}

      {canSend !== undefined && (
        <ChatComposer
          canSend={canSend}
          onSend={onSend}
          onTyping={onTyping}
          readOnlyReason={readOnlyReason}
        />
      )}
    </section>
  );
}
