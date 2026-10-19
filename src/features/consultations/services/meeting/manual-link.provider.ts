import { MeetingLinkProvider, MeetingAppointmentTarget } from "./meeting-link-provider";
import { ValidationError } from "@/shared/lib/errors";

export class ManualLinkProvider implements MeetingLinkProvider {
  async resolveLink(appointment: MeetingAppointmentTarget): Promise<string> {
    const url = appointment.meetingUrl?.trim();
    if (!url) {
      throw new ValidationError("This appointment does not have a meeting link assigned.");
    }

    // Support Google Meet or standard https meeting links
    const isGoogleMeet = /^https?:\/\/meet\.google\.com\/[a-z0-9\-]+$/i.test(url);
    const isHttpsUrl = /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url);

    if (!isGoogleMeet && !isHttpsUrl) {
      throw new ValidationError("Invalid meeting link format. Expected a valid HTTPS URL or Google Meet link.");
    }

    return url;
  }
}

export const manualLinkProvider = new ManualLinkProvider();
