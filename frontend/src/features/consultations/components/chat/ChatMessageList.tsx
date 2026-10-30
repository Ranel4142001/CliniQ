"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Lock } from "lucide-react";
import { getInitials } from "@/lib/format";
import { ChatBubbleGroup } from "@/features/consultations/components/chat/ChatBubbleGroup";
import {
  getSeenMessageId,
  groupMessages,
  type ChatMessageView,
} from "@/features/consultations/utils/group-messages";

/** Distance from the bottom (px) within which the user counts as "following" the conversation. */
const STICK_TO_BOTTOM_THRESHOLD_PX = 80;

interface ChatMessageListProps {
  messages: ChatMessageView[];
  currentUserId: string;
  counterpartName: string;
}

export function ChatMessageList({
  messages,
  currentUserId,
  counterpartName,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFollowingRef = useRef(true);

  const items = useMemo(() => groupMessages(messages, currentUserId), [messages, currentUserId]);
  const seenMessageId = useMemo(
    () => getSeenMessageId(messages, currentUserId),
    [messages, currentUserId]
  );
  const lastMessage = messages[messages.length - 1];

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isFollowingRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_THRESHOLD_PX;
  };

  // Keep the newest message in view, unless the user scrolled up to read history.
  // Always jump down after the user sends a message themselves.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !lastMessage) return;
    if (isFollowingRef.current || lastMessage.sender.id === currentUserId) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lastMessage, currentUserId]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
          {getInitials(counterpartName)}
        </div>
        <p className="mt-1 text-base font-semibold text-foreground">{counterpartName}</p>
        <p className="flex max-w-[260px] items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" />
          Private to you and {counterpartName}. Say hello 👋
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label={`Conversation with ${counterpartName}`}
      className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
    >
      {items.map((item) =>
        item.kind === "divider" ? (
          <div
            key={item.key}
            className="my-1 flex items-center gap-3 text-[11px] text-muted-foreground"
          >
            <span className="h-px flex-1 bg-border" />
            {item.label}
            <span className="h-px flex-1 bg-border" />
          </div>
        ) : (
          <ChatBubbleGroup
            key={item.key}
            sender={item.sender}
            messages={item.messages}
            isMine={item.isMine}
            seenMessageId={seenMessageId}
            counterpartName={counterpartName}
          />
        )
      )}
    </div>
  );
}
