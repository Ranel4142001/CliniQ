import React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/date";
import { getInitials } from "@/lib/format";
import type { ChatMessageView } from "@/features/consultations/utils/group-messages";
import type { ChatParticipant } from "@backend/contracts";

interface ChatBubbleGroupProps {
  sender: ChatParticipant;
  messages: ChatMessageView[];
  isMine: boolean;
  seenMessageId: string | null;
}

/** Messenger-style corner shaping: the side facing the avatar is flattened between grouped bubbles. */
function getBubbleCorners(isMine: boolean, index: number, count: number): string {
  if (count === 1) return "";
  const isFirst = index === 0;
  const isLast = index === count - 1;
  if (isMine) return cn(!isFirst && "rounded-tr-md", !isLast && "rounded-br-md");
  return cn(!isFirst && "rounded-tl-md", !isLast && "rounded-bl-md");
}

function MessageStatus({ message, isSeen }: { message: ChatMessageView; isSeen: boolean }) {
  if (message.isPending) return <span>Sending…</span>;
  if (isSeen) return <span>Seen</span>;
  return null;
}

export function ChatBubbleGroup({ sender, messages, isMine, seenMessageId }: ChatBubbleGroupProps) {
  const lastMessage = messages[messages.length - 1];

  return (
    <div className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary"
          aria-hidden="true"
        >
          {getInitials(sender.fullName)}
        </div>
      )}

      <div className={cn("flex max-w-[78%] flex-col gap-0.5", isMine ? "items-end" : "items-start")}>
        {!isMine && <span className="px-3 text-[11px] text-muted-foreground">{sender.fullName}</span>}

        {messages.map((message, index) => (
          <div key={message.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
            <p
              title={formatTime(message.createdAt)}
              className={cn(
                "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-snug",
                isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                message.isPending && "opacity-60",
                getBubbleCorners(isMine, index, messages.length)
              )}
            >
              {message.body}
            </p>
            {isMine && (message.isPending || message.id === seenMessageId) && (
              <span className="px-1 text-[10px] text-muted-foreground">
                <MessageStatus message={message} isSeen={message.id === seenMessageId} />
              </span>
            )}
          </div>
        ))}

        <span className="px-3 text-[10px] text-muted-foreground">{formatTime(lastMessage.createdAt)}</span>
      </div>
    </div>
  );
}
