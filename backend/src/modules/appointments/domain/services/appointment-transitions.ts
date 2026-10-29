import type { AppointmentStatus, AppointmentType, Role } from "@prisma/client";
import {
  ALLOWED_STATUS_TRANSITIONS,
  APPOINTMENT_CONFIG,
} from "@backend/modules/appointments/domain/constants/appointment.constants";

export function canTransitionStatus(current: AppointmentStatus, next: AppointmentStatus): boolean {
  if (current === next) return true;
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[current] ?? [];
  return allowedNext.includes(next);
}

export function isValidGoogleMeetUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  // Valid Google Meet link pattern: https://meet.google.com/xxx-xxxx-xxx or meet.google.com/...
  return /^https?:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(trimmed);
}

export function canPatientCancelAppointment(
  scheduledAt: Date | string,
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  const apptTime = new Date(scheduledAt).getTime();
  const currentTime = now.getTime();
  const diffInHours = (apptTime - currentTime) / (1000 * 60 * 60);

  if (diffInHours < APPOINTMENT_CONFIG.CANCEL_DEADLINE_HOURS) {
    return {
      allowed: false,
      reason: `Appointments can only be cancelled at least ${APPOINTMENT_CONFIG.CANCEL_DEADLINE_HOURS} hours prior to scheduled time.`,
    };
  }

  return { allowed: true };
}

export function validateStatusTransition(params: {
  currentStatus: AppointmentStatus;
  nextStatus: AppointmentStatus;
  type: AppointmentType;
  meetingUrl?: string | null;
  scheduledAt: Date | string;
  role: Role;
  cancelReason?: string | null;
  now?: Date;
}): { valid: boolean; error?: string } {
  const { currentStatus, nextStatus, type, meetingUrl, scheduledAt, role, cancelReason, now } =
    params;

  if (!canTransitionStatus(currentStatus, nextStatus)) {
    return {
      valid: false,
      error: `Cannot transition appointment from ${currentStatus} to ${nextStatus}.`,
    };
  }

  if (nextStatus === "CONFIRMED" && type === "ONLINE") {
    if (!isValidGoogleMeetUrl(meetingUrl)) {
      return {
        valid: false,
        error:
          "A valid Google Meet link (e.g. https://meet.google.com/abc-defg-hij) is required to confirm an online appointment.",
      };
    }
  }

  if (nextStatus === "CANCELLED") {
    if (!cancelReason || cancelReason.trim().length === 0) {
      return {
        valid: false,
        error: "A cancellation reason is required.",
      };
    }

    if (role === "PATIENT") {
      const cancelCheck = canPatientCancelAppointment(scheduledAt, now);
      if (!cancelCheck.allowed) {
        return {
          valid: false,
          error: cancelCheck.reason,
        };
      }
    }
  }

  return { valid: true };
}
