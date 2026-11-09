"use client";

import React, { use } from "react";
import { ChatThread } from "@/features/consultations";

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = use(params);
  return <ChatThread appointmentId={appointmentId} />;
}
