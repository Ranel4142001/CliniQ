"use client";

import React, { useState } from "react";
import { Copy, Check, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { JoinMeetingButton } from "@/features/consultations/components/JoinMeetingButton";

interface MeetingPanelProps {
  scheduledAt: Date | string;
  meetingUrl?: string | null;
  className?: string;
}

export function MeetingPanel({
  scheduledAt,
  meetingUrl,
  className = "",
}: MeetingPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!meetingUrl) return;
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      notify.success("Meeting link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Failed to copy link to clipboard");
    }
  };

  if (!meetingUrl) {
    return (
      <div className={`rounded-xl border border-dashed p-4 bg-muted/30 text-center ${className}`}>
        <Video className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
        <p className="text-sm font-medium text-foreground">In-Person Consultation</p>
        <p className="text-xs text-muted-foreground">
          No video meeting link required for this appointment.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border bg-card p-4 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Online Consultation Room</h4>
            <p className="text-xs text-muted-foreground">Google Meet Video Call</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-1.5 text-xs h-8"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy Link"}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-xs font-mono text-muted-foreground break-all">
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{meetingUrl}</span>
      </div>

      <div className="pt-1">
        <JoinMeetingButton
          scheduledAt={scheduledAt}
          meetingUrl={meetingUrl}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
