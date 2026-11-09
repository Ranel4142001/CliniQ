import type { RecordNumberGeneratorPort } from "@backend/shared/application/ports/record-number-generator.port";
import { ConflictError } from "@backend/shared/domain/errors/app-error";
import {
  formatRecordNumber,
  recordDayPrefix,
  RECORD_NUMBER_CONFIG,
} from "@backend/shared/domain/record-number";

export interface RecordNumberSources {
  /** Clinic-local date of "now" as yyMMdd. */
  today: () => string;
  /** Uniform random integer in [0, RECORD_RANDOM_RANGE). Must be cryptographically secure. */
  randomEnding: () => number;
}

/** Numbers each day's records 1, 2, 3… and appends random digits; retries if a candidate is taken. */
export function createRecordNumberGenerator({
  today,
  randomEnding,
}: RecordNumberSources): RecordNumberGeneratorPort {
  return {
    async next(prefix, store) {
      const date = today();
      const dayPrefix = recordDayPrefix(prefix, date);
      for (let attempt = 0; attempt < RECORD_NUMBER_CONFIG.MAX_ATTEMPTS; attempt++) {
        // Recounted each attempt, so a record created meanwhile moves us to the next counter.
        const counter = (await store.countIssued(dayPrefix)) + 1;
        const candidate = formatRecordNumber(prefix, date, counter, randomEnding());
        if (!(await store.isTaken(candidate))) return candidate;
      }
      throw new ConflictError("Could not assign a free record number. Please try again.");
    },
  };
}
