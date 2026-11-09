import React from "react";
import { MessageCircle } from "lucide-react";

/** Desktop placeholder beside the chat list; phones show the list itself instead. */
export default function MessagesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageCircle className="h-8 w-8" />
      </div>
      <p className="mt-2 text-lg font-semibold text-foreground">Your messages</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Pick a conversation from the list to read and reply.
      </p>
    </div>
  );
}
