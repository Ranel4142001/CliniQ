import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBadgeCount } from "@/lib/format";
import { ChatAvatar } from "@/features/consultations/components/chat/ChatAvatar";
import { formatInboxTimestamp, type InboxItem } from "@/features/consultations/utils/inbox";

interface ConversationListItemProps {
  item: InboxItem;
  isSelected: boolean;
}

export function ConversationListItem({ item, isSelected }: ConversationListItemProps) {
  const hasUnread = item.unreadCount > 0;

  return (
    <Link
      href={item.href}
      aria-current={isSelected ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      {item.avatar === "clinic" ? (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-white">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : (
        <ChatAvatar name={item.title} className="h-12 w-12 text-sm" />
      )}

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] text-foreground", hasUnread ? "font-semibold" : "font-medium")}>
          {item.title}
        </p>
        <p
          className={cn(
            "flex gap-1 text-[13px]",
            hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="truncate">{item.preview}</span>
          {item.lastMessageAt && (
            <span className="shrink-0">· {formatInboxTimestamp(item.lastMessageAt)}</span>
          )}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{item.meta}</p>
      </div>

      {hasUnread && (
        <span
          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white"
          aria-label={`${item.unreadCount} unread`}
        >
          {formatBadgeCount(item.unreadCount)}
        </span>
      )}
    </Link>
  );
}
