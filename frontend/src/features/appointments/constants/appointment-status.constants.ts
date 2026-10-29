import type { AppointmentStatus } from "@prisma/client";
import type { StatusMap } from "@/components/feedback/StatusBadge";

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
