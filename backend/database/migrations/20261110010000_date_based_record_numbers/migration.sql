-- Renumbers existing patients and prescriptions to PREFIX-YEAR-MONTH-DAY-NNN
-- (e.g. PT-2026-11-10-482), the format the app now issues: the clinic-local (Asia/Manila)
-- date the record was created (patients) or issued (prescriptions), plus a random 3-digit suffix.
-- Rows already in the new format are left alone, so re-running is harmless.
-- Old numbers stay in AuditLog entries and on previously downloaded PDFs.

DO $$
DECLARE
  rec RECORD;
  candidate TEXT;
  attempts INT;
BEGIN
  FOR rec IN
    SELECT "id", "createdAt" AS issued FROM "Patient"
    WHERE "patientNo" !~ '^PT-\d{4}-\d{2}-\d{2}-\d{3}$'
    ORDER BY "createdAt"
  LOOP
    attempts := 0;
    LOOP
      candidate := 'PT-'
        || to_char((rec.issued AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD')
        || '-' || lpad(floor(random() * 1000)::INT::TEXT, 3, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Patient" WHERE "patientNo" = candidate);
      attempts := attempts + 1;
      IF attempts > 5000 THEN
        RAISE EXCEPTION 'No free patient number left for patient % on its creation date', rec."id";
      END IF;
    END LOOP;
    UPDATE "Patient" SET "patientNo" = candidate WHERE "id" = rec."id";
  END LOOP;

  FOR rec IN
    SELECT "id", COALESCE("issuedAt", "createdAt") AS issued FROM "Prescription"
    WHERE "prescriptionNo" IS NOT NULL
      AND "prescriptionNo" !~ '^RX-\d{4}-\d{2}-\d{2}-\d{3}$'
    ORDER BY COALESCE("issuedAt", "createdAt")
  LOOP
    attempts := 0;
    LOOP
      candidate := 'RX-'
        || to_char((rec.issued AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD')
        || '-' || lpad(floor(random() * 1000)::INT::TEXT, 3, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Prescription" WHERE "prescriptionNo" = candidate);
      attempts := attempts + 1;
      IF attempts > 5000 THEN
        RAISE EXCEPTION 'No free prescription number left for prescription % on its issue date', rec."id";
      END IF;
    END LOOP;
    UPDATE "Prescription" SET "prescriptionNo" = candidate WHERE "id" = rec."id";
  END LOOP;
END $$;
