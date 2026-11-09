import React from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date";
import { ChatAvatar } from "@/features/consultations/components/chat/ChatAvatar";
import type { ChatMessageView, ChatReceipt } from "@/features/consultations/utils/group-messages";
import type { ChatParticipant } from "@backend/contracts";

interface ChatBubbleGroupProps {
  sender: ChatParticipant;
  messages: ChatMessageView[];
  isMine: boolean;
  receipt: ChatReceipt | null;
  counterpartName: string;
}

/** Up to a few emoji and nothing else, e.g. "👍" or "🙏😊". Shown large, without a bubble. */
const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️|\s){1,12}$/u;
const HAS_EMOJI = /\p{Extended_Pictographic}/u;
/** Hover tooltip on each message, like Messenger's side timestamp. */
const TOOLTIP_FORMAT = "EEE, MMM d, h:mm a";

function isEmojiOnly(body: string): boolean {
  return EMOJI_ONLY.test(body) && HAS_EMOJI.test(body);
}

/** Messenger-style corner shaping: the side facing the avatar is flattened between grouped bubbles. */
function getBubbleCorners(isMine: boolean, index: number, count: number): string {
  if (count === 1) return "";
  const isFirst = index === 0;
  const isLast = index === count - 1;
  if (isMine) return cn(!isFirst && "rounded-tr-[4px]", !isLast && "rounded-br-[4px]");
  return cn(!isFirst && "rounded-tl-[4px]", !isLast && "rounded-bl-[4px]");
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
  const title = formatDateTime(message.createdAt, TOOLTIP_FORMAT);
  if (isEmojiOnly(message.body)) {
    return (
      <p title={title} className={cn("px-1 text-4xl leading-tight", message.isPending && "opacity-60")}>
        {message.body}
      </p>
    );
  }
  return (
    <p
      title={title}
      className={cn(
        "whitespace-pre-wrap break-words rounded-[18px] px-3 py-2 text-[15px] leading-5",
        // Fixed gradient: like Messenger, bubbles shift from blue to violet as they scroll up the screen.
        isMine
          ? "bg-gradient-to-b from-violet-600 to-primary bg-fixed text-white"
          : "bg-muted text-foreground",
        message.isPending && "opacity-60",
        corners
      )}
    >
      {message.body}
    </p>
  );
}

function Receipt({ message, receipt, counterpartName }: {
  message: ChatMessageView;
  receipt: ChatReceipt | null;
  counterpartName: string;
}) {
  if (message.isPending) {
    return <span className="px-1 text-[11px] text-muted-foreground">Sending…</span>;
  }
  if (receipt?.messageId !== message.id) return null;
  if (receipt.isSeen) {
    return (
      <span className="mt-0.5" title={`Seen by ${counterpartName}`}>
        <ChatAvatar name={counterpartName} className="h-3.5 w-3.5 text-[6px]" />
        <span className="sr-only">Seen</span>
      </span>
    );
  }
  return (
    <span className="mt-0.5 text-muted-foreground" title="Sent">
      <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Sent</span>
    </span>
  );
}

export function ChatBubbleGroup({
  sender,
  messages,
  isMine,
  receipt,
  counterpartName,
}: ChatBubbleGroupProps) {
  return (
    <div className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && <ChatAvatar name={sender.fullName} className="mb-0.5 h-7 w-7 text-[10px]" />}

      <div className={cn("flex max-w-[75%] flex-col gap-0.5", isMine ? "items-end" : "items-start")}>
        {messages.map((message, index) => (
          <div key={message.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
            <MessageBody
              message={message}
              isMine={isMine}
              corners={getBubbleCorners(isMine, index, messages.length)}
            />
            {isMine && <Receipt message={message} receipt={receipt} counterpartName={counterpartName} />}
          </div>
        ))}
      </div>
    </div>
  );
}
