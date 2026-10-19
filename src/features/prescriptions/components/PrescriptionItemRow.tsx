"use client";

import React from "react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Trash2 } from "lucide-react";
import { MedicineSelect } from "@/features/medicines/components/MedicineSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { COMMON_FREQUENCIES } from "../constants/prescription.constants";
import type { CreatePrescriptionInput } from "../schemas/prescription.schema";

interface PrescriptionItemRowProps {
  index: number;
  register: UseFormRegister<CreatePrescriptionInput>;
  setValue: UseFormSetValue<CreatePrescriptionInput>;
  watch: UseFormWatch<CreatePrescriptionInput>;
  errors: FieldErrors<CreatePrescriptionInput>;
  onRemove: () => void;
  canRemove: boolean;
}

export function PrescriptionItemRow({
  index,
  register,
  setValue,
  watch,
  errors,
  onRemove,
  canRemove,
}: PrescriptionItemRowProps) {
  const currentMedId = watch(`items.${index}.medicineId`);
  const itemErrors = errors.items?.[index];

  return (
    <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Label className="text-xs">Medication *</Label>
          <MedicineSelect
            value={currentMedId}
            onValueChange={(val) => setValue(`items.${index}.medicineId`, val)}
            placeholder="Select prescribed medication..."
          />
          {itemErrors?.medicineId && (
            <p className="text-xs text-destructive mt-0.5">{itemErrors.medicineId.message}</p>
          )}
        </div>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-rose-600 mt-4">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">Dosage *</Label>
          <Input placeholder="e.g. 500mg, 1 tab" {...register(`items.${index}.dosage`)} className="h-8 text-xs" />
        </div>

        <div>
          <Label className="text-xs">Frequency *</Label>
          <Select
            value={watch(`items.${index}.frequency`) || ""}
            onValueChange={(val) => setValue(`items.${index}.frequency`, val)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Frequency" /></SelectTrigger>
            <SelectContent>
              {COMMON_FREQUENCIES.map((freq) => (
                <SelectItem key={freq} value={freq} className="text-xs">{freq}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Duration (days) *</Label>
          <Input
            type="number"
            min="1"
            placeholder="Days"
            {...register(`items.${index}.durationDays`, { valueAsNumber: true })}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Total Qty *</Label>
          <Input
            type="number"
            min="1"
            placeholder="Qty"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Special Instructions (optional)</Label>
        <Input placeholder="e.g. Take with water after meals" {...register(`items.${index}.instructions`)} className="h-8 text-xs" />
      </div>
    </div>
  );
}
