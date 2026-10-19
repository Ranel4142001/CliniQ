import { z } from "zod";
import { DOSAGE_FORMS, MEDICINE_UNITS } from "../constants/medicine.constants";

export const createMedicineSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  genericName: z.string().trim().optional(),
  dosageForm: z.enum(DOSAGE_FORMS),
  strength: z.string().trim().min(1, "Strength is required"),
  unit: z.enum(MEDICINE_UNITS),
  reorderLevel: z.number().int().min(0),
});

export const updateMedicineSchema = createMedicineSchema
  .partial()
  .extend({ isArchived: z.boolean().optional() });

export const stockInSchema = z.object({
  batchNo: z.string().trim().min(1, "Batch number is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  expiryDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid expiry date"),
  cost: z.number().min(0).optional(),
});

export const stockOutSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().trim().optional(),
  batchId: z.string().uuid().optional(),
});

export const adjustmentSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().trim().min(1, "Reason is required for adjustments"),
  batchId: z.string().uuid().optional(),
});

export const movementActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("STOCK_OUT") }).merge(stockOutSchema),
  z.object({ type: z.literal("ADJUSTMENT") }).merge(adjustmentSchema),
]);

export const listMedicinesSchema = z.object({
  search: z.string().trim().optional(),
  isArchived: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listMovementsSchema = z.object({
  medicineId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;
export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
export type MovementActionInput = z.infer<typeof movementActionSchema>;
export type ListMedicinesInput = z.infer<typeof listMedicinesSchema>;
export type ListMovementsInput = z.infer<typeof listMovementsSchema>;
