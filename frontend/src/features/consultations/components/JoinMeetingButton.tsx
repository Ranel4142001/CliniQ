"use client";

import React from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canJoinMeeting } from "@/features/consultations/utils/can-join-meeting";

interface JoinMeetingButtonProps {
  scheduledAt: Date | string;
  meetingUrl?: string | null;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  label?: string;
}

export function JoinMeetingButton({
  scheduledAt,
  meetingUrl,
  size = "default",
  variant = "default",
  className = "",
  label = "Join Video Consultation",
}: JoinMeetingButtonProps) {
  const result = canJoinMeeting(scheduledAt, meetingUrl);

  const handleJoin = () => {
    if (!result.canJoin || !meetingUrl) return;
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={!result.canJoin}
        onClick={handleJoin}
        title={result.reason}
        className={`gap-2 ${className}`}
      >
        <Video className="h-4 w-4" />
        <span>{label}</span>
      </Button>
      {!result.canJoin && result.reason && (
        <span className="text-[11px] text-muted-foreground italic">
          {result.reason}
        </span>
      )}
    </div>
  );
}
