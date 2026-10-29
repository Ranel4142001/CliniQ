"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { Lock, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CHAT_CONFIG } from "@backend/contracts";

/** Show the character counter once the draft reaches this share of the limit. */
const COUNTER_VISIBLE_RATIO = 0.9;

interface ChatComposerProps {
  canSend: boolean;
  onSend: (body: string) => void;
}

export function ChatComposer({ canSend, onSend }: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = draft.trim();
  const isTooLong = draft.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH;
  const showCounter = draft.length >= CHAT_CONFIG.MAX_MESSAGE_LENGTH * COUNTER_VISIBLE_RATIO;

  // Grow with content up to the CSS max-height, then scroll.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const submit = () => {
    if (!trimmed || isTooLong) return;
    onSend(trimmed);
    setDraft("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a newline; ignore Enter while an IME is composing.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  if (!canSend) {
    return (
      <div className="flex items-center justify-center gap-1.5 border-t px-4 py-3 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        This conversation is read-only.
      </div>
    );
  }

  return (
    <form
      className="flex items-end gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-1 flex-col">
        <Textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          aria-label="Type a message"
          className="max-h-32 min-h-[40px] resize-none rounded-2xl bg-muted/60 px-4 py-2.5"
        />
        {showCounter && (
          <span className={cn("mt-1 self-end text-[10px]", isTooLong ? "text-destructive" : "text-muted-foreground")}>
            {draft.length}/{CHAT_CONFIG.MAX_MESSAGE_LENGTH}
          </span>
        )}
      </div>
      <Button
        type="submit"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-full"
        disabled={!trimmed || isTooLong}
        aria-label="Send message"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
