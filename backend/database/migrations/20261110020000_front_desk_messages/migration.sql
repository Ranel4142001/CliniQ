-- CreateTable
CREATE TABLE "FrontDeskMessage" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "isFromPatient" BOOLEAN NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrontDeskMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrontDeskMessage_patientId_createdAt_idx" ON "FrontDeskMessage"("patientId", "createdAt");

-- AddForeignKey
ALTER TABLE "FrontDeskMessage" ADD CONSTRAINT "FrontDeskMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskMessage" ADD CONSTRAINT "FrontDeskMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Same defense in depth as every other table: no access through the public Data API.
ALTER TABLE "FrontDeskMessage" ENABLE ROW LEVEL SECURITY;
