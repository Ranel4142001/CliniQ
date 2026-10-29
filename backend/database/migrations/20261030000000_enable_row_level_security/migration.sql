-- Defense in depth for Supabase: deny all access through the public Data API.
-- CliniQ's backend connects as the table owner, which is not subject to RLS,
-- so application access is unchanged. No policies are defined on purpose:
-- the anon and authenticated roles get zero rows from every table.

ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Consultation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsultationMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Medicine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicineBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrescriptionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Counter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
