"use client";

import React from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { FrontDeskChat } from "@/features/consultations/components/front-desk/FrontDeskChat";

/** Right pane of the Messages page for a front-desk thread; the API enforces who may open it. */
export function FrontDeskThread({ patientId }: { patientId: string }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) return <LoadingState message="Opening conversation…" className="h-full" />;

  return (
    <FrontDeskChat
      key={patientId}
      patientId={patientId}
      currentUser={{ id: user.id, fullName: user.fullName, role: user.role }}
    />
  );
}
