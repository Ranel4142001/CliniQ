import { randomInt } from "node:crypto";
import { formatInTimeZone } from "date-fns-tz";
import { createRecordNumberGenerator } from "@backend/shared/application/record-number-generator";
import { CLINIC_TIMEZONE } from "@backend/shared/domain/clinic-timezone";
import { RECORD_RANDOM_RANGE } from "@backend/shared/domain/record-number";

/** Record numbers dated in clinic time, with random digits from the OS CSPRNG (never Math.random). */
export const recordNumberGenerator = createRecordNumberGenerator({
  today: () => formatInTimeZone(new Date(), CLINIC_TIMEZONE, "yyMMdd"),
  randomEnding: () => randomInt(RECORD_RANDOM_RANGE),
});
