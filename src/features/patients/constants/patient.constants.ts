/** Blood type options */
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

/** Sex labels */
export const SEX_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
};

/** Patient-owned fields that a PATIENT role can self-edit */
export const PATIENT_SELF_EDIT_FIELDS = [
  "contactNumber",
  "address",
  "emergencyName",
  "emergencyContact",
  "allergies",
] as const;

/** Minimum age (in years) above which guardian fields are not required */
export const GUARDIAN_AGE_THRESHOLD = 18;
