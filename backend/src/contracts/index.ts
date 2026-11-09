/**
 * Public contract between the backend and the frontend.
 *
 * The frontend may import ONLY from this file (enforced by ESLint and by
 * tests/architecture). Everything re-exported here must be safe to bundle for
 * the browser: request schemas, response DTO types, domain constants and pure
 * helpers. Never re-export services, repositories, Prisma or Supabase clients.
 */

// Shared kernel
export * from "../shared/domain/roles";
export * from "../shared/domain/person-name";
export * from "../shared/application/dto/api.types";

// Auth
export * from "../modules/auth/application/dto/auth.schema";
export * from "../modules/auth/application/dto/auth.types";

// Patients
export * from "../modules/patients/application/dto/patient.schema";
export * from "../modules/patients/application/dto/patient.types";
export * from "../modules/patients/domain/constants/patient.constants";

// Appointments
export * from "../modules/appointments/application/dto/appointment.schema";
export * from "../modules/appointments/application/dto/appointment.types";
export * from "../modules/appointments/domain/constants/appointment.constants";
export type { AppointmentSlot } from "../modules/appointments/domain/services/generate-slots";

// Consultations
export * from "../modules/consultations/application/dto/consultation.schema";
export * from "../modules/consultations/application/dto/consultation.types";
export * from "../modules/consultations/application/dto/consultation-message.schema";
export * from "../modules/consultations/application/dto/consultation-message.types";
export * from "../modules/consultations/domain/constants/consultation.constants";

// Front desk
export * from "../modules/front-desk/application/dto/front-desk.schema";
export * from "../modules/front-desk/application/dto/front-desk.types";
export * from "../modules/front-desk/domain/constants/front-desk.constants";

// Medicines
export * from "../modules/medicines/application/dto/medicine.schema";
export * from "../modules/medicines/application/dto/medicine.types";
export * from "../modules/medicines/domain/constants/medicine.constants";

// Prescriptions
export * from "../modules/prescriptions/application/dto/prescription.schema";
export * from "../modules/prescriptions/application/dto/prescription.types";
export * from "../modules/prescriptions/domain/constants/prescription.constants";

// Dashboard & reports
export * from "../modules/dashboard/application/dto/dashboard.types";
export * from "../modules/reports/application/dto/reports.types";
