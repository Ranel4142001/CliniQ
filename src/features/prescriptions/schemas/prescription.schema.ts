import { z } from "zod";
import { PRESCRIPTION_STATUS } from "../constants/prescription.constants";

export const prescriptionItemSchema = z.object({
  medicineId: z.string().uuid("Please select a valid medicine"),
  dosage: z.string().trim().min(1, "Dosage is required (e.g. 500mg, 1 tablet)"),
  frequency: z.string().trim().min(1, "Frequency is required (e.g. Twice daily)"),
  durationDays: z.number().int().min(1, "Duration must be at least 1 day"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  instructions: z.string().trim().optional(),
});

export const createPrescriptionSchema = z.object({
  consultationId: z.string().uuid("Invalid consultation ID"),
  notes: z.string().trim().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine item is required"),
});

export const updatePrescriptionSchema = z.object({
  notes: z.string().trim().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine item is required").optional(),
});

export const voidPrescriptionSchema = z.object({
  voidReason: z.string().trim().min(1, "Reason is required when voiding a prescription"),
});

export const listPrescriptionsSchema = z.object({
  patientId: z.string().uuid().optional(),
  consultationId: z.string().uuid().optional(),
  status: z.enum([
    PRESCRIPTION_STATUS.DRAFT,
    PRESCRIPTION_STATUS.ISSUED,
    PRESCRIPTION_STATUS.DISPENSED,
    PRESCRIPTION_STATUS.VOIDED,
  ]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
export type VoidPrescriptionInput = z.infer<typeof voidPrescriptionSchema>;
export type ListPrescriptionsInput = z.infer<typeof listPrescriptionsSchema>;
