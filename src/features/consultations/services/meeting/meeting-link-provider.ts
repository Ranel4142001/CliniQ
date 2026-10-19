export interface MeetingAppointmentTarget {
  id: string;
  meetingUrl?: string | null;
  scheduledAt?: Date | string;
}

export interface MeetingLinkProvider {
  /**
   * Resolves and returns a valid meeting URL for an appointment.
   * Throws ValidationError or AppError if a valid link cannot be resolved.
   */
  resolveLink(appointment: MeetingAppointmentTarget): Promise<string>;
}
