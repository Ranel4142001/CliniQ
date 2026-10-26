import { z } from "zod";

/** Shared helper — age check for guardian requirement */
function requiresGuardian(birthDate: string): boolean {
  const birth = new Date(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  const adjustedAge = m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? age - 1 : age;
  return adjustedAge < 18;
}

/** Fields editable by all roles */
const basePatientFields = {
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((d) => new Date(d) < new Date(), "Birth date must be in the past"),
  sex: z.enum(["MALE", "FEMALE"], { error: "Sex is required" }),
  contactNumber: z.string().trim().min(7, "Contact number is required"),
  address: z.string().trim().min(3, "Address is required"),
  emergencyName: z.string().trim().min(1, "Emergency contact name is required"),
  emergencyContact: z.string().trim().min(7, "Emergency contact number is required"),
  bloodType: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  existingConditions: z.string().trim().optional(),
};

/** Fields only STAFF/ADMIN can set during creation */
const staffCreateFields = {
  guardianName: z.string().trim().optional(),
  guardianContact: z.string().trim().optional(),
  consentGiven: z.literal(true, {
    error: "Patient consent is required",
  }),
};

/**
 * Schema for STAFF/ADMIN creating a patient (staff-create mode).
 */
export const createPatientSchema = z
  .object({ ...basePatientFields, ...staffCreateFields })
  .refine(
    (data) => {
      if (requiresGuardian(data.birthDate)) {
        return !!data.guardianName?.trim() && !!data.guardianContact?.trim();
      }
      return true;
    },
    {
      message: "Guardian name and contact are required for patients under 18",
      path: ["guardianName"],
    }
  );

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

/**
 * Schema for patient self-registration (self-register mode).
 * Same as staff-create — patients must also give consent.
 */
export const selfRegisterPatientSchema = createPatientSchema;
export type SelfRegisterPatientInput = CreatePatientInput;

/**
 * Schema for editing a patient.
 * PATIENT role may only update contact, address, emergency contact, allergies.
 */
export const editPatientSchema = z.object({
  contactNumber: z.string().trim().min(7).optional(),
  address: z.string().trim().min(3).optional(),
  emergencyName: z.string().trim().min(1).optional(),
  emergencyContact: z.string().trim().min(7).optional(),
  allergies: z.string().trim().optional(),
  // STAFF/ADMIN additional fields
  firstName: z.string().trim().min(1).optional(),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1).optional(),
  bloodType: z.string().trim().optional(),
  existingConditions: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  guardianContact: z.string().trim().optional(),
});

export type EditPatientInput = z.infer<typeof editPatientSchema>;

/** Query params for listing patients */
export const listPatientsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  isArchived: z.coerce.boolean().default(false),
});

export type ListPatientsInput = z.infer<typeof listPatientsSchema>;
