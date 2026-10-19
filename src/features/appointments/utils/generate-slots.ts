import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { format, getDay, addMinutes, isBefore } from "date-fns";
import {
  APPOINTMENT_CONFIG,
  CLINIC_TIMEZONE,
} from "../constants/appointment.constants";
import { hasConflict, TimeInterval } from "./has-conflict";

export interface AppointmentSlot {
  start: string; // ISO UTC string
  end: string; // ISO UTC string
  timeLabel: string; // e.g. "8:00 AM - 8:30 AM"
  isAvailable: boolean;
  reason?: string;
}

/**
 * Generates all 30-minute appointment slots for a given date in Asia/Manila timezone,
 * checking against working hours (08:00-17:00 M-F), booked appointments, and past times.
 */
export function generateSlots(
  dateStr: string, // "YYYY-MM-DD"
  bookedIntervals: TimeInterval[] = [],
  now: Date = new Date()
): AppointmentSlot[] {
  // Parse date into Manila midnight to check day of week
  const dateInManila = toZonedTime(`${dateStr}T00:00:00`, CLINIC_TIMEZONE);
  const dayOfWeek = getDay(dateInManila); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Clinic is closed on weekends
  if (!APPOINTMENT_CONFIG.WORK_DAYS.includes(dayOfWeek as 1 | 2 | 3 | 4 | 5)) {
    return [];
  }

  const slots: AppointmentSlot[] = [];
  const startHour = APPOINTMENT_CONFIG.START_HOUR; // 8
  const endHour = APPOINTMENT_CONFIG.END_HOUR; // 17
  const duration = APPOINTMENT_CONFIG.SLOT_DURATION_MINUTES; // 30

  // 08:00 AM Manila in UTC
  let currentStart = fromZonedTime(`${dateStr} ${String(startHour).padStart(2, "0")}:00:00`, CLINIC_TIMEZONE);
  const dayEnd = fromZonedTime(`${dateStr} ${String(endHour).padStart(2, "0")}:00:00`, CLINIC_TIMEZONE);

  while (isBefore(currentStart, dayEnd)) {
    const currentEnd = addMinutes(currentStart, duration);

    // Format human-readable label in Manila time
    const startZoned = toZonedTime(currentStart, CLINIC_TIMEZONE);
    const endZoned = toZonedTime(currentEnd, CLINIC_TIMEZONE);
    const timeLabel = `${format(startZoned, "h:mm a")} - ${format(endZoned, "h:mm a")}`;

    const isPast = isBefore(currentStart, now);
    const isBooked = hasConflict(currentStart, currentEnd, bookedIntervals);

    let isAvailable = true;
    let reason: string | undefined;

    if (isPast) {
      isAvailable = false;
      reason = "Time slot is in the past";
    } else if (isBooked) {
      isAvailable = false;
      reason = "Slot is already booked";
    }

    slots.push({
      start: currentStart.toISOString(),
      end: currentEnd.toISOString(),
      timeLabel,
      isAvailable,
      reason,
    });

    currentStart = currentEnd;
  }

  return slots;
}
