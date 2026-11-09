import type { RecordPrefix } from "@backend/shared/domain/record-number";

/** Lookups on the owning table, ideally inside the caller's transaction. */
export interface RecordNumberStore {
  isTaken(candidate: string): Promise<boolean>;
  /** How many numbers already start with `dayPrefix`, e.g. "PT-261110-". */
  countIssued(dayPrefix: string): Promise<number>;
}

/**
 * Issues list-friendly record numbers such as `PT-261110-347`: the clinic-local issue date (yyMMdd),
 * the record's position that day (3 = third), and two random digits.
 */
export interface RecordNumberGeneratorPort {
  next(prefix: RecordPrefix, store: RecordNumberStore): Promise<string>;
}
