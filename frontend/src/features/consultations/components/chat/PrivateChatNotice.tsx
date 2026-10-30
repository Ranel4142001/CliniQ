import React from "react";
import { Lock, MessageCircle } from "lucide-react";

interface PrivateChatNoticeProps {
  patientName: string;
  clinicianName: string;
}

/** Shown to admins/staff on online visits: the chat exists, but only its two participants can read it. */
export function PrivateChatNotice({ patientName, clinicianName }: PrivateChatNoticeProps) {
  return (
    <section
      aria-label="Consultation chat"
      className="rounded-xl border border-dashed bg-muted/30 p-5 text-center"
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageCircle className="h-5 w-5" />
      </div>
      <h4 className="mt-3 text-sm font-semibold text-foreground">Private consultation chat</h4>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        This online visit has a private chat between{" "}
        <span className="font-medium text-foreground">{patientName}</span> and{" "}
        <span className="font-medium text-foreground">{clinicianName}</span>. Only they can read and
        send messages.
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-[11px] text-muted-foreground ring-1 ring-border">
        <Lock className="h-3 w-3" /> Hidden from admins and staff for patient privacy
      </p>
    </section>
  );
}
