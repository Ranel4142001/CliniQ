import { z } from "zod";
import { VITALS_RANGES } from "@backend/modules/consultations/domain/constants/consultation.constants";

export const vitalsSchema = z
  .object({
    bloodPressure: z
      .string()
      .regex(/^\d{2,3}\/\d{2,3}$/, "Must be formatted as systolic/diastolic (e.g. 120/80)")
      .optional()
      .or(z.literal("")),
    temperature: z
      .number()
      .min(
        VITALS_RANGES.TEMPERATURE.MIN,
        `Temperature cannot be below ${VITALS_RANGES.TEMPERATURE.MIN}°C`
      )
      .max(
        VITALS_RANGES.TEMPERATURE.MAX,
        `Temperature cannot exceed ${VITALS_RANGES.TEMPERATURE.MAX}°C`
      )
      .optional(),
    pulseRate: z
      .number()
      .int()
      .min(
        VITALS_RANGES.PULSE_RATE.MIN,
        `Pulse rate cannot be below ${VITALS_RANGES.PULSE_RATE.MIN} bpm`
      )
      .max(
        VITALS_RANGES.PULSE_RATE.MAX,
        `Pulse rate cannot exceed ${VITALS_RANGES.PULSE_RATE.MAX} bpm`
      )
      .optional(),
    respiratoryRate: z
      .number()
      .int()
      .min(
        VITALS_RANGES.RESPIRATORY_RATE.MIN,
        `Respiratory rate cannot be below ${VITALS_RANGES.RESPIRATORY_RATE.MIN} cpm`
      )
      .max(
        VITALS_RANGES.RESPIRATORY_RATE.MAX,
        `Respiratory rate cannot exceed ${VITALS_RANGES.RESPIRATORY_RATE.MAX} cpm`
      )
      .optional(),
    oxygenSaturation: z
      .number()
      .min(
        VITALS_RANGES.OXYGEN_SATURATION.MIN,
        `SpO2 cannot be below ${VITALS_RANGES.OXYGEN_SATURATION.MIN}%`
      )
      .max(VITALS_RANGES.OXYGEN_SATURATION.MAX, "SpO2 cannot exceed 100%")
      .optional(),
    weight: z
      .number()
      .min(VITALS_RANGES.WEIGHT.MIN, `Weight cannot be below ${VITALS_RANGES.WEIGHT.MIN} kg`)
      .max(VITALS_RANGES.WEIGHT.MAX, `Weight cannot exceed ${VITALS_RANGES.WEIGHT.MAX} kg`)
      .optional(),
    height: z
      .number()
      .min(VITALS_RANGES.HEIGHT.MIN, `Height cannot be below ${VITALS_RANGES.HEIGHT.MIN} cm`)
      .max(VITALS_RANGES.HEIGHT.MAX, `Height cannot exceed ${VITALS_RANGES.HEIGHT.MAX} cm`)
      .optional(),
    bmi: z.number().optional(),
    notes: z.string().max(500).optional(),
  })
  .optional();

export const startConsultationSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
  chiefComplaint: z
    .string()
    .trim()
    .min(3, "Chief complaint must be at least 3 characters")
    .max(1000, "Chief complaint cannot exceed 1000 characters")
    .optional(),
});

export type StartConsultationInput = z.infer<typeof startConsultationSchema>;

export const updateConsultationSchema = z.object({
  chiefComplaint: z
    .string()
    .trim()
    .min(3, "Chief complaint must be at least 3 characters")
    .max(1000, "Chief complaint cannot exceed 1000 characters")
    .optional(),
  vitals: vitalsSchema,
  findings: z.string().trim().max(4000).optional(),
  diagnosis: z.string().trim().max(2000).optional(),
  treatmentPlan: z.string().trim().max(4000).optional(),
});

export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;

export const completeConsultationSchema = z.object({
  diagnosis: z
    .string()
    .trim()
    .min(3, "Diagnosis is required before completing the consultation")
    .max(2000),
  treatmentPlan: z.string().trim().max(4000).optional(),
});

export type CompleteConsultationInput = z.infer<typeof completeConsultationSchema>;
