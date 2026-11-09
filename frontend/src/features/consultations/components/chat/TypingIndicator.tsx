import React from "react";
import { ChatAvatar } from "@/features/consultations/components/chat/ChatAvatar";

/** Staggered start of each dot, so they bounce in a wave. */
const DOT_DELAYS_MS = [0, 150, 300];

/** Messenger-style "…" bubble shown while the other participant is typing. */
export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2" role="status">
      <ChatAvatar name={name} className="h-7 w-7 text-[10px]" />
      <div className="flex h-9 items-center gap-1 rounded-[18px] bg-muted px-3.5">
        {DOT_DELAYS_MS.map((delay) => (
          <span
            key={delay}
            aria-hidden="true"
            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <span className="sr-only">{name} is typing</span>
    </div>
  );
}
