-- CreateTable
CREATE TABLE "ConsultationChatPresence" (
    "appointmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typingAt" TIMESTAMP(3),

    CONSTRAINT "ConsultationChatPresence_pkey" PRIMARY KEY ("appointmentId","userId")
);

-- AddForeignKey
ALTER TABLE "ConsultationChatPresence" ADD CONSTRAINT "ConsultationChatPresence_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationChatPresence" ADD CONSTRAINT "ConsultationChatPresence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same defense in depth as every other table: no access through the public Data API.
ALTER TABLE "ConsultationChatPresence" ENABLE ROW LEVEL SECURITY;
