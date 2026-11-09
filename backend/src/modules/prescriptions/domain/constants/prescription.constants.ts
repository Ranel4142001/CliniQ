export const PRESCRIPTION_STATUS = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  DISPENSED: "DISPENSED",
  VOIDED: "VOIDED",
} as const;

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUS)[keyof typeof PRESCRIPTION_STATUS];

export const PRESCRIPTION_STATUS_MAP = {
  DRAFT: { label: "Draft", tone: "neutral" as const },
  ISSUED: { label: "Issued", tone: "blue" as const },
  DISPENSED: { label: "Dispensed", tone: "green" as const },
  VOIDED: { label: "Voided", tone: "red" as const },
};

export const COMMON_FREQUENCIES = [
  "Once daily",
  "Twice daily (every 12 hours)",
  "Three times daily (every 8 hours)",
  "Four times daily (every 6 hours)",
  "Every 4 hours as needed",
  "Once at bedtime",
  "As needed for pain/fever",
] as const;

export const COMMON_DURATIONS = [
  { label: "3 days", days: 3 },
  { label: "5 days", days: 5 },
  { label: "7 days (1 week)", days: 7 },
  { label: "10 days", days: 10 },
  { label: "14 days (2 weeks)", days: 14 },
  { label: "30 days (1 month)", days: 30 },
] as const;
