/** Prefixes of the human-readable numbers shown in lists, e.g. PT-261110-347. */
export const RECORD_PREFIXES = {
  PATIENT: "PT",
  PRESCRIPTION: "RX",
} as const;

export type RecordPrefix = (typeof RECORD_PREFIXES)[keyof typeof RECORD_PREFIXES];

export const RECORD_NUMBER_CONFIG = {
  /** Random digits after the day's counter. */
  RANDOM_DIGITS: 2,
  /** Random draws before giving up (only needed when two records race for the same counter). */
  MAX_ATTEMPTS: 30,
} as const;

/** Number of distinct random endings, e.g. 100 for 2 digits. */
export const RECORD_RANDOM_RANGE = 10 ** RECORD_NUMBER_CONFIG.RANDOM_DIGITS;

/** PREFIX-YYMMDD-<counter starting at 1><2 random digits>. */
export const RECORD_NUMBER_PATTERN = /^(PT|RX)-\d{6}-[1-9]\d{2,}$/;

/** "PT-261110-": every number issued on that day starts with this. */
export function recordDayPrefix(prefix: RecordPrefix, localDate: string): string {
  return `${prefix}-${localDate}-`;
}

/**
 * e.g. formatRecordNumber("PT", "261110", 12, 7) → "PT-261110-1207".
 * `localDate` is the clinic-local issue date as yyMMdd; `counter` is the record's position that day.
 */
export function formatRecordNumber(
  prefix: RecordPrefix,
  localDate: string,
  counter: number,
  random: number
): string {
  const ending = String(random).padStart(RECORD_NUMBER_CONFIG.RANDOM_DIGITS, "0");
  return `${recordDayPrefix(prefix, localDate)}${counter}${ending}`;
}
