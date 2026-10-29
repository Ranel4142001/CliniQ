import { CONSULTATION_CONFIG } from "@backend/contracts";
import type { CanJoinMeetingResult } from "@backend/contracts";

/**
 * Determines whether a patient or attendee can join an online consultation meeting.
 * Rule: Join button is enabled from 15 minutes before scheduled start until 60 minutes after.
 *
 * @param scheduledAt - The scheduled start time of the appointment
 * @param meetingUrl - The meeting URL (must exist and be non-empty)
 * @param now - Current reference time (defaults to new Date())
 */
export function canJoinMeeting(
  scheduledAt: Date | string,
  meetingUrl?: string | null,
  now: Date = new Date()
): CanJoinMeetingResult {
  if (!meetingUrl || typeof meetingUrl !== "string" || !meetingUrl.trim()) {
    return {
      canJoin: false,
      reason: "No meeting link has been provided for this appointment.",
    };
  }

  const apptTime = new Date(scheduledAt).getTime();
  const currentTime = now.getTime();

  if (isNaN(apptTime)) {
    return {
      canJoin: false,
      reason: "Invalid appointment schedule.",
    };
  }

  const windowBeforeMs = CONSULTATION_CONFIG.MEETING_JOIN_WINDOW_BEFORE_MINUTES * 60 * 1000;
  const windowAfterMs = CONSULTATION_CONFIG.MEETING_JOIN_WINDOW_AFTER_MINUTES * 60 * 1000;

  const earliestAllowedTime = apptTime - windowBeforeMs;
  const latestAllowedTime = apptTime + windowAfterMs;

  if (currentTime < earliestAllowedTime) {
    const diffMs = earliestAllowedTime - currentTime;
    const minutesUntilOpen = Math.ceil(diffMs / (60 * 1000));
    return {
      canJoin: false,
      minutesUntilOpen,
      reason: `Meeting link will open ${CONSULTATION_CONFIG.MEETING_JOIN_WINDOW_BEFORE_MINUTES} minutes before your appointment (in ${minutesUntilOpen} min).`,
    };
  }

  if (currentTime > latestAllowedTime) {
    return {
      canJoin: false,
      isExpired: true,
      reason: "The meeting link has expired (consultation window has ended).",
    };
  }

  return {
    canJoin: true,
  };
}
