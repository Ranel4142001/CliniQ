export {
  PatientCredentialForm,
  type PatientFormValues,
} from "./components/PatientCredentialForm";
export { PatientTable } from "./components/PatientTable";
export { PatientProfileCard } from "./components/PatientProfileCard";
export { PatientHistoryTabs } from "./components/PatientHistoryTabs";
export { PatientSelect } from "./components/PatientSelect";

// Hooks
export { usePatients } from "./hooks/usePatients";
export { usePatient } from "./hooks/usePatient";
export { usePatientHistory } from "./hooks/usePatientHistory";
export { useCreatePatient } from "./hooks/useCreatePatient";
export { useUpdatePatient } from "./hooks/useUpdatePatient";
export { useArchivePatient } from "./hooks/useArchivePatient";

// Schemas & Types
export {
  createPatientSchema,
  editPatientSchema,
  listPatientsSchema,
  type CreatePatientInput,
  type EditPatientInput,
  type ListPatientsInput,
} from "./schemas/patient.schema";

export type {
  PatientDTO,
  PatientListItem,
  PatientHistoryItem,
} from "./types/patient.types";

// Services (for server-side imports)
export { patientService } from "./services/patient.service";
