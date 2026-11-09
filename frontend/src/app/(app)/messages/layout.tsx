"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ConversationList } from "@/features/consultations";

/**
 * Messenger-style Messages page for every role: chat list on the left, open conversation on the right.
 * On phones only one pane shows at a time; the chat's back arrow returns to the list.
 * Height fills the viewport below the top bar, minus the page padding at each breakpoint.
 */
export default function MessagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const isThreadOpen = pathname !== ROUTES.MESSAGES;

  if (!user) return <LoadingState message="Loading messages…" />;

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[26rem] overflow-hidden rounded-2xl border bg-card shadow-sm sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)]">
      <aside
        className={cn(
          "w-full flex-col border-r md:flex md:w-80 md:shrink-0 lg:w-96",
          isThreadOpen ? "hidden" : "flex"
        )}
      >
        <ConversationList role={user.role} selectedHref={pathname} />
      </aside>
      <section className={cn("min-w-0 flex-1 flex-col", isThreadOpen ? "flex" : "hidden md:flex")}>
        {children}
      </section>
    </div>
  );
}
