import React, { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import { canJoinMeeting } from "@/features/consultations/utils/can-join-meeting";
import { getPresenceLabel } from "@/features/consultations/utils/presence-label";
import type { ChatCounterpartStatusDTO } from "@backend/contracts";

interface ChatHeaderProps {
  counterpartName: string;
  subtitle: string;
  /** Replaces the subtitle with "Active now" / "Active 5m ago" when known. */
  status?: ChatCounterpartStatusDTO;
  meetingUrl?: string | null;
  scheduledAt?: string | Date;
  /** Shows a back arrow (full-page chat). */
  backHref?: string;
  /** E.g. "md:hidden" when the inbox is already visible beside the chat. */
  backClassName?: string;
  /** Shows an expand button (embedded panel). */
  expandHref?: string;
  /** Replaces the initials in the avatar, e.g. a clinic icon. */
  avatarIcon?: ReactNode;
}

const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function VideoCallButton({
  meetingUrl,
  scheduledAt,
}: {
  meetingUrl?: string | null;
  scheduledAt?: string | Date;
}) {
  if (!meetingUrl || !scheduledAt) return null;
  const join = canJoinMeeting(scheduledAt, meetingUrl);
  if (!join.canJoin) {
    return (
      <span
        className={cn(ICON_BUTTON, "cursor-not-allowed opacity-40")}
        title={join.reason ?? "Video call not open yet"}
      >
        <Video className="h-5 w-5" />
        <span className="sr-only">Video call not available yet</span>
      </span>
    );
  }
  return (
    <a
      href={meetingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={ICON_BUTTON}
      title="Join video call"
    >
      <Video className="h-5 w-5" />
      <span className="sr-only">Join video call</span>
    </a>
  );
}

/** Messenger-style conversation header: who you are talking to, plus call and navigation actions. */
export function ChatHeader({
  counterpartName,
  subtitle,
  status,
  meetingUrl,
  scheduledAt,
  backHref,
  backClassName,
  expandHref,
  avatarIcon,
}: ChatHeaderProps) {
  const presenceLabel = getPresenceLabel(status);

  return (
    <header className="flex items-center gap-2 border-b bg-background/80 px-2 py-2 backdrop-blur sm:px-3">
      {backHref && (
        <Link href={backHref} className={cn(ICON_BUTTON, backClassName)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-sm font-semibold text-white">
        {avatarIcon ?? getInitials(counterpartName)}
        {status?.isActive && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
        )}
      </div>
      <div className="min-w-0 flex-1 pl-1">
        <h4 className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {counterpartName}
        </h4>
        <p className="truncate text-xs text-muted-foreground" title={subtitle}>
          {presenceLabel ?? subtitle}
        </p>
      </div>
      <VideoCallButton meetingUrl={meetingUrl} scheduledAt={scheduledAt} />
      {expandHref && (
        <Link
          href={expandHref}
          className={ICON_BUTTON}
          aria-label="Open full chat"
          title="Open full chat"
        >
          <Maximize2 className="h-[18px] w-[18px]" />
        </Link>
      )}
    </header>
  );
}
