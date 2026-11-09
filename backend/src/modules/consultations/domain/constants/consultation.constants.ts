export const CONSULTATION_CONFIG = {
  MEETING_JOIN_WINDOW_BEFORE_MINUTES: 15,
  MEETING_JOIN_WINDOW_AFTER_MINUTES: 60,
} as const;

export const VITALS_RANGES = {
  TEMPERATURE: { MIN: 35.0, MAX: 42.0, UNIT: "°C" },
  PULSE_RATE: { MIN: 40, MAX: 200, UNIT: "bpm" },
  RESPIRATORY_RATE: { MIN: 8, MAX: 60, UNIT: "cpm" },
  SYSTOLIC_BP: { MIN: 70, MAX: 220, UNIT: "mmHg" },
  DIASTOLIC_BP: { MIN: 40, MAX: 130, UNIT: "mmHg" },
  OXYGEN_SATURATION: { MIN: 70, MAX: 100, UNIT: "%" },
  WEIGHT: { MIN: 1.0, MAX: 300.0, UNIT: "kg" },
  HEIGHT: { MIN: 30.0, MAX: 250.0, UNIT: "cm" },
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  HISTORY_LIMIT: 200,
  POLL_INTERVAL_MS: 3000,
  /** Consecutive messages from the same sender within this window are visually grouped. */
  GROUP_WINDOW_MINUTES: 5,
  /** A centered timestamp is shown when messages are further apart than this. */
  TIMESTAMP_GAP_MINUTES: 15,
  /** Seen in the chat (any poll) within this window counts as "Active now". */
  ACTIVE_WINDOW_SECONDS: 30,
  /** A typing ping keeps the "typing…" dots visible for this long. */
  TYPING_WINDOW_SECONDS: 6,
  /** The composer sends at most one typing ping per interval while the user types. */
  TYPING_PING_INTERVAL_MS: 3000,
  /** Most recent online appointments listed in the Messages inbox. */
  INBOX_LIMIT: 50,
  /** How often the inbox and the sidebar's unread badge refresh. */
  INBOX_POLL_INTERVAL_MS: 10000,
} as const;
