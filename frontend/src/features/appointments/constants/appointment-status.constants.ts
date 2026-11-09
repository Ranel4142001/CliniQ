import type { AppointmentStatus } from "@prisma/client";
import type { StatusMap } from "@/components/feedback/StatusBadge";

export const APPOINTMENT_STATUS_MAP: StatusMap<AppointmentStatus> = {
  PENDING: { label: "Pending Confirmation", tone: "amber" },
  CONFIRMED: { label: "Confirmed", tone: "blue" },
  COMPLETED: { label: "Completed", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "red" },
  NO_SHOW: { label: "No Show", tone: "neutral" },
};
