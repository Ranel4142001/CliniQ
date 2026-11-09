/** Prefixes of the human-readable numbers shown in lists, e.g. PT-2026-11-10-482. */
export const RECORD_PREFIXES = {
  PATIENT: "PT",
  PRESCRIPTION: "RX",
} as const;

export type RecordPrefix = (typeof RECORD_PREFIXES)[keyof typeof RECORD_PREFIXES];

export const RECORD_NUMBER_CONFIG = {
  /** Random digits after the date; allows 1,000 numbers per prefix per day. */
  SUFFIX_DIGITS: 3,
  /** Random draws before giving up on a (nearly full) day. */
  MAX_ATTEMPTS: 30,
} as const;

/** Number of distinct suffixes, e.g. 1000 for 3 digits. */
export const RECORD_SUFFIX_RANGE = 10 ** RECORD_NUMBER_CONFIG.SUFFIX_DIGITS;

export const RECORD_NUMBER_PATTERN = /^(PT|RX)-\d{4}-\d{2}-\d{2}-\d{3}$/;

/**
 * PREFIX-YEAR-MONTH-DAY-NNN, e.g. formatRecordNumber("PT", "2026-11-10", 7) → "PT-2026-11-10-007".
 * `localDate` is the clinic-local issue date as yyyy-MM-dd.
 */
export function formatRecordNumber(prefix: RecordPrefix, localDate: string, suffix: number): string {
  const digits = String(suffix).padStart(RECORD_NUMBER_CONFIG.SUFFIX_DIGITS, "0");
  return `${prefix}-${localDate}-${digits}`;
}
