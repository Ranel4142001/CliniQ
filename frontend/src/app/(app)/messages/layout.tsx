"use client";

import React, { ReactNode } from "react";
import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { canUseChat, ConversationList } from "@/features/consultations";

/**
 * Messenger-style Messages page: chat list on the left, open conversation on the right.
 * On phones only one pane shows at a time; the chat's back arrow returns to the list.
 * Height fills the viewport below the top bar, minus the page padding at each breakpoint.
 */
export default function MessagesLayout({ children }: { children: ReactNode }) {
  const { appointmentId } = useParams<{ appointmentId?: string }>();
  const { user } = useCurrentUser();
  const selectedId = appointmentId ?? null;

  if (user && !canUseChat(user.role)) {
    return (
      <EmptyState
        icon={<Lock className="h-6 w-6" />}
        title="Messages are private"
        description="Consultation chats are only visible to the patient and their clinician."
      />
    );
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[26rem] overflow-hidden rounded-2xl border bg-card shadow-sm sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)]">
      <aside
        className={cn(
          "w-full flex-col border-r md:flex md:w-80 md:shrink-0 lg:w-96",
          selectedId ? "hidden" : "flex"
        )}
      >
        <ConversationList selectedId={selectedId} />
      </aside>
      <section className={cn("min-w-0 flex-1 flex-col", selectedId ? "flex" : "hidden md:flex")}>
        {children}
      </section>
    </div>
  );
}
