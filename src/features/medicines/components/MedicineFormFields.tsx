"use client";

import React from "react";
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DOSAGE_FORMS,
  MEDICINE_UNITS,
  type DosageForm,
  type MedicineUnit,
} from "../constants/medicine.constants";
import type { CreateMedicineInput } from "../schemas/medicine.schema";

interface MedicineFormFieldsProps {
  register: UseFormRegister<CreateMedicineInput>;
  errors: FieldErrors<CreateMedicineInput>;
  watch: UseFormWatch<CreateMedicineInput>;
  setValue: UseFormSetValue<CreateMedicineInput>;
}

export function MedicineFormFields({
  register,
  errors,
  watch,
  setValue,
}: MedicineFormFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <Label htmlFor="name">Brand / Trade Name *</Label>
        <Input id="name" placeholder="e.g. Paracetamol" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="genericName">Generic Name</Label>
        <Input id="genericName" placeholder="e.g. Acetaminophen" {...register("genericName")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Dosage Form *</Label>
          <Select
            value={watch("dosageForm")}
            onValueChange={(val) => setValue("dosageForm", val as DosageForm)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {DOSAGE_FORMS.map((form) => (
                <SelectItem key={form} value={form}>
                  {form}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Unit *</Label>
          <Select
            value={watch("unit")}
            onValueChange={(val) => setValue("unit", val as MedicineUnit)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {MEDICINE_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="strength">Strength *</Label>
          <Input id="strength" placeholder="e.g. 500mg or 250mg/5ml" {...register("strength")} />
          {errors.strength && <p className="text-xs text-destructive">{errors.strength.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="reorderLevel">Reorder Level *</Label>
          <Input
            id="reorderLevel"
            type="number"
            min="0"
            {...register("reorderLevel", { valueAsNumber: true })}
          />
          {errors.reorderLevel && (
            <p className="text-xs text-destructive">{errors.reorderLevel.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
