// Components
export { JoinMeetingButton } from "./components/JoinMeetingButton";
export { MeetingPanel } from "./components/MeetingPanel";
export { VitalsForm } from "./components/VitalsForm";
export { ConsultationNotesForm } from "./components/ConsultationNotesForm";
export { ConsultationPatientSidebar } from "./components/ConsultationPatientSidebar";

// Constants
export {
  CONSULTATION_CONFIG,
  VITALS_RANGES,
} from "./constants/consultation.constants";

// Types
export type {
  VitalsData,
  ConsultationWithRelations,
  CanJoinMeetingResult,
} from "./types/consultation.types";

// Schemas
export {
  vitalsSchema,
  startConsultationSchema,
  updateConsultationSchema,
  completeConsultationSchema,
  type StartConsultationInput,
  type UpdateConsultationInput,
  type CompleteConsultationInput,
} from "./schemas/consultation.schema";

// Hooks
export {
  useConsultation,
  useConsultationByAppointment,
  useConsultations,
  useStartConsultation,
  useUpdateConsultation,
  useCompleteConsultation,
} from "./hooks/use-consultations";

// Utils
export { canJoinMeeting } from "./utils/can-join-meeting";

// Service & Providers
export {
  ConsultationService,
  consultationService,
} from "./services/consultation.service";
export {
  type MeetingLinkProvider,
  type MeetingAppointmentTarget,
} from "./services/meeting/meeting-link-provider";
export {
  ManualLinkProvider,
  manualLinkProvider,
} from "./services/meeting/manual-link.provider";
