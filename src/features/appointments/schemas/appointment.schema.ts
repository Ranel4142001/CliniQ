import { z } from "zod";

export const bookAppointmentSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID").optional(),
  clinicianId: z.string().uuid("Please select a clinician"),
  scheduledAt: z
    .string()
    .datetime({ message: "Invalid scheduled date/time" })
    .refine(
      (dt) => new Date(dt) > new Date(),
      "Cannot book an appointment in the past"
    ),
  type: z.enum(["IN_PERSON", "ONLINE"], { error: "Please select appointment type" }),
  reason: z.string().trim().min(3, "Reason for appointment must be at least 3 characters"),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ message: "Invalid scheduled date/time" })
    .refine(
      (dt) => new Date(dt) > new Date(),
      "Cannot reschedule to a past date/time"
    ),
  meetingUrl: z.string().trim().optional().nullable(),
});

export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  meetingUrl: z.string().trim().optional().nullable(),
  cancelReason: z.string().trim().optional().nullable(),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

export const querySlotsSchema = z.object({
  clinicianId: z.string().uuid("Valid clinician ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type QuerySlotsInput = z.infer<typeof querySlotsSchema>;

export const listAppointmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  type: z.enum(["IN_PERSON", "ONLINE"]).optional(),
  clinicianId: z.string().optional(),
  patientId: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>;
