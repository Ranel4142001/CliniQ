"use client";

import React, { useMemo, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { ROLES, type Role } from "@backend/contracts";
import { SearchInput } from "@/components/data-table/SearchInput";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConversationListItem } from "@/features/consultations/components/inbox/ConversationListItem";
import { useInbox } from "@/features/consultations/hooks/useInbox";
import { filterInbox, type InboxItem } from "@/features/consultations/utils/inbox";

/** Typing filters instantly; the list is already in memory. */
const SEARCH_DEBOUNCE_MS = 0;

const EMPTY_TEXT: Record<Role, string> = {
  [ROLES.PATIENT]: "Message the clinic front desk, or your doctor once you have an online appointment.",
  [ROLES.CLINICIAN]: "A private chat opens with the patient for every online appointment. It will appear here.",
  [ROLES.ADMIN]: "When a patient messages the clinic, or you message one from their profile, it appears here.",
  [ROLES.STAFF]: "When a patient messages the clinic, or you message one from their profile, it appears here.",
};

function ListMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageCircle className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ListBody({ items, query, selectedHref, role }: {
  items: InboxItem[];
  query: string;
  selectedHref: string;
  role: Role;
}) {
  const visible = useMemo(() => filterInbox(items, query), [items, query]);

  if (items.length === 0) return <ListMessage title="No conversations yet" description={EMPTY_TEXT[role]} />;
  if (visible.length === 0) {
    return <ListMessage title="No matches" description={`No chats matching “${query.trim()}”.`} />;
  }
  return (
    <ul className="space-y-0.5">
      {visible.map((item) => (
        <li key={item.key}>
          <ConversationListItem item={item} isSelected={item.href === selectedHref} />
        </li>
      ))}
    </ul>
  );
}

/** Left pane of the Messages page: the viewer's chats, searchable, newest activity first. */
export function ConversationList({ role, selectedHref }: { role: Role; selectedHref: string }) {
  const [query, setQuery] = useState("");
  const { items, isLoading, error, refetch } = useInbox(role);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b px-4 pb-3 pt-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Chats</h2>
        <SearchInput value={query} onChange={setQuery} placeholder="Search" debounceMs={SEARCH_DEBOUNCE_MS} />
      </div>

      <nav aria-label="Conversations" className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading conversations" />
          </div>
        ) : error ? (
          <ErrorState
            title="Chats unavailable"
            message={error instanceof Error ? error.message : "Conversations could not be loaded."}
            onRetry={refetch}
          />
        ) : (
          <ListBody items={items} query={query} selectedHref={selectedHref} role={role} />
        )}
      </nav>
    </div>
  );
}
