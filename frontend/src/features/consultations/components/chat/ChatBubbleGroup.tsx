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
  counterpartName: string;
}

/** Up to a few emoji and nothing else, e.g. "👍" or "🙏😊". Shown large, without a bubble. */
const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️|\s){1,12}$/u;
const HAS_EMOJI = /\p{Extended_Pictographic}/u;

function isEmojiOnly(body: string): boolean {
  return EMOJI_ONLY.test(body) && HAS_EMOJI.test(body);
}

/** Messenger-style corner shaping: the side facing the avatar is flattened between grouped bubbles. */
function getBubbleCorners(isMine: boolean, index: number, count: number): string {
  if (count === 1) return "";
  const isFirst = index === 0;
  const isLast = index === count - 1;
  if (isMine) return cn(!isFirst && "rounded-tr-md", !isLast && "rounded-br-md");
  return cn(!isFirst && "rounded-tl-md", !isLast && "rounded-bl-md");
}

function Avatar({ name, className }: { name: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

function MessageBody({
  message,
  isMine,
  corners,
}: {
  message: ChatMessageView;
  isMine: boolean;
  corners: string;
}) {
  if (isEmojiOnly(message.body)) {
    return (
      <p
        title={formatTime(message.createdAt)}
        className={cn("px-1 text-4xl leading-tight", message.isPending && "opacity-60")}
      >
        {message.body}
      </p>
    );
  }
  return (
    <p
      title={formatTime(message.createdAt)}
      className={cn(
        "whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2 text-sm leading-snug",
        isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        message.isPending && "opacity-60",
        corners
      )}
    >
      {message.body}
    </p>
  );
}

export function ChatBubbleGroup({
  sender,
  messages,
  isMine,
  seenMessageId,
  counterpartName,
}: ChatBubbleGroupProps) {
  const lastMessage = messages[messages.length - 1];

  return (
    <div className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && <Avatar name={sender.fullName} className="mb-5 h-7 w-7 text-[10px]" />}

      <div
        className={cn("flex max-w-[78%] flex-col gap-0.5", isMine ? "items-end" : "items-start")}
      >
        {!isMine && (
          <span className="px-3 text-[11px] text-muted-foreground">{sender.fullName}</span>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn("flex flex-col", isMine ? "items-end" : "items-start")}
          >
            <MessageBody
              message={message}
              isMine={isMine}
              corners={getBubbleCorners(isMine, index, messages.length)}
            />
            {isMine && message.isPending && (
              <span className="px-1 text-[10px] text-muted-foreground">Sending…</span>
            )}
            {isMine && message.id === seenMessageId && (
              <span className="mt-0.5 flex items-center" title={`Seen by ${counterpartName}`}>
                <Avatar name={counterpartName} className="h-4 w-4 text-[7px] ring-2 ring-background" />
                <span className="sr-only">Seen</span>
              </span>
            )}
          </div>
        ))}

        <span className="px-3 text-[10px] text-muted-foreground">
          {formatTime(lastMessage.createdAt)}
        </span>
      </div>
    </div>
  );
}
