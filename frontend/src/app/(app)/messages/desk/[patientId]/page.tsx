"use client";

import React, { use } from "react";
import { FrontDeskThread } from "@/features/consultations";

export default function FrontDeskThreadPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  return <FrontDeskThread patientId={patientId} />;
}
