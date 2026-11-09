import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date";
import { formatBadgeCount } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import type { ChatConversationDTO } from "@backend/contracts";
import type { AppointmentStatus } from "@prisma/client";
import { ChatAvatar } from "@/features/consultations/components/chat/ChatAvatar";
import {
  formatInboxTimestamp,
  getConversationPreview,
} from "@/features/consultations/utils/inbox";

/** Shown after the visit date when the chat is no longer (or not yet) open. */
const STATUS_NOTES: Partial<Record<AppointmentStatus, string>> = {
  PENDING: "Awaiting confirmation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Missed",
};

interface ConversationListItemProps {
  conversation: ChatConversationDTO;
  isSelected: boolean;
}

export function ConversationListItem({ conversation, isSelected }: ConversationListItemProps) {
  const { counterpartName, lastMessage, unreadCount, status } = conversation;
  const hasUnread = unreadCount > 0;
  const statusNote = STATUS_NOTES[status];

  return (
    <Link
      href={ROUTES.MESSAGE_THREAD(conversation.appointmentId)}
      aria-current={isSelected ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <ChatAvatar name={counterpartName} className="h-12 w-12 text-sm" />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[15px] text-foreground",
            hasUnread ? "font-semibold" : "font-medium"
          )}
        >
          {counterpartName}
        </p>
        <p
          className={cn(
            "flex gap-1 text-[13px]",
            hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="truncate">{getConversationPreview(conversation)}</span>
          {lastMessage && (
            <span className="shrink-0">· {formatInboxTimestamp(lastMessage.createdAt)}</span>
          )}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          Visit {formatDateTime(conversation.scheduledAt, "MMM d, h:mm a")}
          {statusNote && ` · ${statusNote}`}
        </p>
      </div>

      {hasUnread && (
        <span
          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white"
          aria-label={`${unreadCount} unread`}
        >
          {formatBadgeCount(unreadCount)}
        </span>
      )}
    </Link>
  );
}
