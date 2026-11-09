export const FRONT_DESK_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  /** Most recent messages loaded per thread. */
  HISTORY_LIMIT: 200,
  /** Most recently active patient threads listed in the desk inbox. */
  INBOX_LIMIT: 50,
} as const;
