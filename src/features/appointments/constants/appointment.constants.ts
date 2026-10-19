import type { AppointmentStatus, AppointmentType } from "@prisma/client";
import type { StatusMap } from "@/shared/components/feedback/StatusBadge";

export const CLINIC_TIMEZONE = "Asia/Manila";

export const APPOINTMENT_CONFIG = {
  START_HOUR: 8, // 08:00 AM
  END_HOUR: 17, // 05:00 PM (closing time)
  SLOT_DURATION_MINUTES: 30,
  WORK_DAYS: [1, 2, 3, 4, 5], // Monday (1) to Friday (5)
  CANCEL_DEADLINE_HOURS: 2, // Must cancel at least 2 hours prior
  MAX_FUTURE_BOOKING_DAYS: 60,
} as const;

export const APPOINTMENT_STATUS_MAP: StatusMap<AppointmentStatus> = {
  PENDING: {
    label: "Pending Confirmation",
    variant: "outline",
    className: "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "default",
    className: "bg-blue-600 hover:bg-blue-600 text-white",
  },
  COMPLETED: {
    label: "Completed",
    variant: "default",
    className: "bg-emerald-600 hover:bg-emerald-600 text-white",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive",
  },
  NO_SHOW: {
    label: "No Show",
    variant: "secondary",
    className: "bg-muted text-muted-foreground",
  },
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  IN_PERSON: "In-Person Consultation",
  ONLINE: "Online Consultation (Google Meet)",
};

/** Valid status transitions state machine */
export const ALLOWED_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
