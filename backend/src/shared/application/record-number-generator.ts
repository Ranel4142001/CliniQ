import type { RecordNumberGeneratorPort } from "@backend/shared/application/ports/record-number-generator.port";
import { ConflictError } from "@backend/shared/domain/errors/app-error";
import {
  formatRecordNumber,
  RECORD_NUMBER_CONFIG,
} from "@backend/shared/domain/record-number";

export interface RecordNumberSources {
  /** Clinic-local date of "now" as yyyy-MM-dd. */
  today: () => string;
  /** Uniform random integer in [0, RECORD_SUFFIX_RANGE). Must be cryptographically secure. */
  randomSuffix: () => number;
}

/** Draws random suffixes until one is free for today's date. */
export function createRecordNumberGenerator({
  today,
  randomSuffix,
}: RecordNumberSources): RecordNumberGeneratorPort {
  return {
    async next(prefix, isTaken) {
      const date = today();
      for (let attempt = 0; attempt < RECORD_NUMBER_CONFIG.MAX_ATTEMPTS; attempt++) {
        const candidate = formatRecordNumber(prefix, date, randomSuffix());
        if (!(await isTaken(candidate))) return candidate;
      }
      throw new ConflictError(
        "Could not assign a free record number for today. Please try again."
      );
    },
  };
}
