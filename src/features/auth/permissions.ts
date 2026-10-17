import { Role, ROLES } from "@/shared/constants/roles";

export type AuthAction =
  | "manage_users"
  | "view_patient_demographics"
  | "edit_patient_demographics"
  | "view_clinical_history"
  | "book_appointment"
  | "manage_appointment"
  | "write_consultation"
  | "view_medicines"
  | "change_stock"
  | "issue_prescription"
  | "dispense_prescription"
  | "view_prescriptions"
  | "view_reports"
  | "view_audit_log";

const PERMISSION_MATRIX: Record<Role, Record<AuthAction, boolean>> = {
  [ROLES.ADMIN]: {
    manage_users: true,
    view_patient_demographics: true,
    edit_patient_demographics: true,
    view_clinical_history: true,
    book_appointment: true,
    manage_appointment: true,
    write_consultation: false, // Clinicians write notes
    view_medicines: true,
    change_stock: true,
    issue_prescription: false, // Clinicians issue Rx
    dispense_prescription: false, // Staff dispenses Rx
    view_prescriptions: true,
    view_reports: true,
    view_audit_log: true,
  },
  [ROLES.CLINICIAN]: {
    manage_users: false,
    view_patient_demographics: true,
    edit_patient_demographics: true,
    view_clinical_history: true,
    book_appointment: true,
    manage_appointment: true,
    write_consultation: true,
    view_medicines: true,
    change_stock: false,
    issue_prescription: true,
    dispense_prescription: false,
    view_prescriptions: true,
    view_reports: true,
    view_audit_log: false,
  },
  [ROLES.STAFF]: {
    manage_users: false,
    view_patient_demographics: true,
    edit_patient_demographics: true,
    view_clinical_history: false,
    book_appointment: true,
    manage_appointment: true,
    write_consultation: false,
    view_medicines: true,
    change_stock: true,
    issue_prescription: false,
    dispense_prescription: true,
    view_prescriptions: true,
    view_reports: true,
    view_audit_log: false,
  },
  [ROLES.PATIENT]: {
    manage_users: false,
    view_patient_demographics: true, // own only
    edit_patient_demographics: true, // own limited fields
    view_clinical_history: true, // own only
    book_appointment: true, // own only
    manage_appointment: true, // cancel own only
    write_consultation: false,
    view_medicines: false,
    change_stock: false,
    issue_prescription: false,
    dispense_prescription: false,
    view_prescriptions: true, // own only
    view_reports: false,
    view_audit_log: false,
  },
};

export function can(role: Role | null | undefined, action: AuthAction): boolean {
  if (!role || !PERMISSION_MATRIX[role]) return false;
  return PERMISSION_MATRIX[role][action] ?? false;
}
