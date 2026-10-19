// Components
export { AppointmentTable } from "./components/AppointmentTable";
export { AppointmentCalendar } from "./components/AppointmentCalendar";
export { BookAppointmentForm } from "./components/BookAppointmentForm";
export { SlotPicker } from "./components/SlotPicker";
export { AppointmentActions } from "./components/AppointmentActions";
export { ClinicianSelect } from "./components/ClinicianSelect";

// Hooks
export { useAppointments } from "./hooks/useAppointments";
export { useAppointment } from "./hooks/useAppointment";
export { useAvailableSlots } from "./hooks/useAvailableSlots";
export { useBookAppointment } from "./hooks/useBookAppointment";
export { useRescheduleAppointment } from "./hooks/useRescheduleAppointment";
export { useUpdateAppointmentStatus } from "./hooks/useUpdateAppointmentStatus";

// Constants
export {
  APPOINTMENT_CONFIG,
  APPOINTMENT_STATUS_MAP,
  APPOINTMENT_TYPE_LABELS,
  ALLOWED_STATUS_TRANSITIONS,
} from "./constants/appointment.constants";

// Schemas & Types
export {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentStatusSchema,
  querySlotsSchema,
  listAppointmentsSchema,
  type BookAppointmentInput,
  type RescheduleAppointmentInput,
  type UpdateAppointmentStatusInput,
  type QuerySlotsInput,
  type ListAppointmentsInput,
} from "./schemas/appointment.schema";

export type {
  AppointmentDTO,
  AppointmentListItem,
} from "./types/appointment.types";

// Pure utilities
export { generateSlots, type AppointmentSlot } from "./utils/generate-slots";
export { hasConflict } from "./utils/has-conflict";
export {
  canTransitionStatus,
  isValidGoogleMeetUrl,
  canPatientCancelAppointment,
  validateStatusTransition,
} from "./utils/appointment-transitions";

// Service
export { appointmentService } from "./services/appointment.service";
