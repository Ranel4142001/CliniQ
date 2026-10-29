import {
  MeetingLinkProvider,
  MeetingAppointmentTarget,
} from "@backend/modules/consultations/application/ports/outbound/meeting-link-provider.port";
import { ValidationError } from "@backend/shared/domain/errors/app-error";

export class ManualLinkProvider implements MeetingLinkProvider {
  async resolveLink(appointment: MeetingAppointmentTarget): Promise<string> {
    const url = appointment.meetingUrl?.trim();
    if (!url) {
      throw new ValidationError("This appointment does not have a meeting link assigned.");
    }

    // Support Google Meet or standard https meeting links
    const isGoogleMeet = /^https?:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(url);
    const isHttpsUrl = /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url);

    if (!isGoogleMeet && !isHttpsUrl) {
      throw new ValidationError(
        "Invalid meeting link format. Expected a valid HTTPS URL or Google Meet link."
      );
    }

    return url;
  }
}

export const manualLinkProvider = new ManualLinkProvider();
