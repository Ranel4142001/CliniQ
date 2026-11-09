"use client";

import React, { useMemo, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { SearchInput } from "@/components/data-table/SearchInput";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { ChatConversationDTO } from "@backend/contracts";
import { ConversationListItem } from "@/features/consultations/components/inbox/ConversationListItem";
import { useConversations } from "@/features/consultations/hooks/useConversations";
import { filterConversations } from "@/features/consultations/utils/inbox";

/** Typing filters instantly; the list is already in memory. */
const SEARCH_DEBOUNCE_MS = 0;

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

function ListBody({
  conversations,
  query,
  selectedId,
}: {
  conversations: ChatConversationDTO[];
  query: string;
  selectedId: string | null;
}) {
  const visible = useMemo(() => filterConversations(conversations, query), [conversations, query]);

  if (conversations.length === 0) {
    return (
      <ListMessage
        title="No conversations yet"
        description="A private chat opens for every online appointment. It will appear here."
      />
    );
  }
  if (visible.length === 0) {
    return <ListMessage title="No matches" description={`No chats with a name containing “${query.trim()}”.`} />;
  }
  return (
    <ul className="space-y-0.5">
      {visible.map((conversation) => (
        <li key={conversation.appointmentId}>
          <ConversationListItem
            conversation={conversation}
            isSelected={conversation.appointmentId === selectedId}
          />
        </li>
      ))}
    </ul>
  );
}

/** Left pane of the Messages page: searchable list of the user's chats, newest activity first. */
export function ConversationList({ selectedId }: { selectedId: string | null }) {
  const [query, setQuery] = useState("");
  const { data, isLoading, error, refetch } = useConversations();

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b px-4 pb-3 pt-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Chats</h2>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name"
          debounceMs={SEARCH_DEBOUNCE_MS}
        />
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
            onRetry={() => refetch()}
          />
        ) : (
          <ListBody conversations={data ?? []} query={query} selectedId={selectedId} />
        )}
      </nav>
    </div>
  );
}
