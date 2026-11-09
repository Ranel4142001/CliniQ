-- Renumbers existing patients and prescriptions to PREFIX-YYMMDD-<counter><2 random digits>
-- (e.g. PT-261110-347 = third patient registered on 10 Nov 2026), the format the app now issues.
-- The date is clinic-local (Asia/Manila): creation date for patients, issue date for prescriptions.
-- Each day's records are counted 1, 2, 3… in the order they were created.
-- Rows already in the new format are left alone, so re-running is harmless.
-- Old numbers stay in AuditLog entries and on previously downloaded PDFs.

DO $$
DECLARE
  rec RECORD;
  day_prefix TEXT;
  candidate TEXT;
  attempts INT;
BEGIN
  FOR rec IN
    SELECT "id", "createdAt" AS issued FROM "Patient"
    WHERE "patientNo" !~ '^PT-\d{6}-[1-9]\d{2,}$'
    ORDER BY "createdAt", "id"
  LOOP
    day_prefix := 'PT-' || to_char((rec.issued AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila', 'YYMMDD') || '-';
    attempts := 0;
    LOOP
      candidate := day_prefix
        || ((SELECT count(*) FROM "Patient" WHERE "patientNo" LIKE day_prefix || '%') + 1)::TEXT
        || lpad(floor(random() * 100)::INT::TEXT, 2, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Patient" WHERE "patientNo" = candidate);
      attempts := attempts + 1;
      IF attempts > 1000 THEN
        RAISE EXCEPTION 'No free patient number for patient %', rec."id";
      END IF;
    END LOOP;
    UPDATE "Patient" SET "patientNo" = candidate WHERE "id" = rec."id";
  END LOOP;

  FOR rec IN
    SELECT "id", COALESCE("issuedAt", "createdAt") AS issued FROM "Prescription"
    WHERE "prescriptionNo" IS NOT NULL
      AND "prescriptionNo" !~ '^RX-\d{6}-[1-9]\d{2,}$'
    ORDER BY COALESCE("issuedAt", "createdAt"), "id"
  LOOP
    day_prefix := 'RX-' || to_char((rec.issued AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila', 'YYMMDD') || '-';
    attempts := 0;
    LOOP
      candidate := day_prefix
        || ((SELECT count(*) FROM "Prescription" WHERE "prescriptionNo" LIKE day_prefix || '%') + 1)::TEXT
        || lpad(floor(random() * 100)::INT::TEXT, 2, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Prescription" WHERE "prescriptionNo" = candidate);
      attempts := attempts + 1;
      IF attempts > 1000 THEN
        RAISE EXCEPTION 'No free prescription number for prescription %', rec."id";
      END IF;
    END LOOP;
    UPDATE "Prescription" SET "prescriptionNo" = candidate WHERE "id" = rec."id";
  END LOOP;
END $$;
