import type { AppointmentSlot } from "@backend/contracts";

export type DoctorStatus = "AVAILABLE" | "FULLY_BOOKED" | "DONE_FOR_TODAY" | "CLOSED";

export interface DoctorAvailability {
  status: DoctorStatus;
  /** e.g. "8:00 AM – 5:00 PM"; null when the clinic is closed today. */
  hours: string | null;
  /** Start of the first open slot, e.g. "10:30 AM". */
  nextFree: string | null;
  openSlots: number;
}

/** "8:00 AM - 8:30 AM" → ["8:00 AM", "8:30 AM"] */
const splitLabel = (label: string) => label.split(" - ");

/** Summarises one doctor's slots for today into what the front desk needs at a glance. */
export function summarizeAvailability(
  slots: AppointmentSlot[],
  now: Date = new Date()
): DoctorAvailability {
  if (slots.length === 0) {
    return { status: "CLOSED", hours: null, nextFree: null, openSlots: 0 };
  }

  const hours = `${splitLabel(slots[0].timeLabel)[0]} – ${splitLabel(slots[slots.length - 1].timeLabel)[1]}`;
  const free = slots.filter((slot) => slot.isAvailable);
  if (free.length > 0) {
    return {
      status: "AVAILABLE",
      hours,
      nextFree: splitLabel(free[0].timeLabel)[0],
      openSlots: free.length,
    };
  }

  const dayIsOver = new Date(slots[slots.length - 1].end).getTime() <= now.getTime();
  return {
    status: dayIsOver ? "DONE_FOR_TODAY" : "FULLY_BOOKED",
    hours,
    nextFree: null,
    openSlots: 0,
  };
}
