import type { RecordPrefix } from "@backend/shared/domain/record-number";

/**
 * Issues list-friendly record numbers such as `PT-2026-11-10-482`: the clinic-local issue date
 * plus an unpredictable suffix, so numbers reveal neither record counts nor neighbouring records.
 */
export interface RecordNumberGeneratorPort {
  /** `isTaken` checks the owning table, ideally inside the caller's transaction. */
  next(prefix: RecordPrefix, isTaken: (candidate: string) => Promise<boolean>): Promise<string>;
}
