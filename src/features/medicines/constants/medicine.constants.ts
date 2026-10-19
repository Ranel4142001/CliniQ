export const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Drops",
  "Injection",
  "Ointment",
  "Cream",
  "Inhaler",
  "Suppository",
] as const;

export type DosageForm = (typeof DOSAGE_FORMS)[number];

export const MEDICINE_UNITS = [
  "mg",
  "g",
  "mcg",
  "ml",
  "IU",
  "%",
  "puffs",
] as const;

export type MedicineUnit = (typeof MEDICINE_UNITS)[number];

export const STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  EXPIRED: "EXPIRED",
} as const;

export type StockStatus = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS];

export const STOCK_STATUS_MAP = {
  IN_STOCK: { label: "In Stock", variant: "default" as const, className: "bg-emerald-600 text-white" },
  LOW_STOCK: { label: "Low Stock", variant: "outline" as const, className: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  OUT_OF_STOCK: { label: "Out of Stock", variant: "destructive" as const },
  EXPIRED: { label: "Expired", variant: "destructive" as const, className: "bg-rose-700 text-white" },
};

export const MEDICINE_CONFIG = {
  DEFAULT_REORDER_LEVEL: 10,
  EXPIRING_SOON_DAYS: 60, // Batches expiring within 60 days flag as expiring soon
  URGENT_EXPIRY_DAYS: 30, // Batches expiring within 30 days
} as const;
