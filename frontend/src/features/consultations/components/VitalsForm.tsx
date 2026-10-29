"use client";

import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";
import type { UpdateConsultationInput } from "@backend/contracts";

interface VitalsFormProps {
  form: UseFormReturn<UpdateConsultationInput>;
  isReadOnly?: boolean;
}

export function VitalsForm({ form, isReadOnly = false }: VitalsFormProps) {
  const { register, watch, setValue, formState: { errors } } = form;

  const weight = watch("vitals.weight");
  const height = watch("vitals.height");

  // Auto-calculate BMI when height and weight are provided
  useEffect(() => {
    if (weight && height && height > 0) {
      const heightInMeters = height / 100;
      const calculatedBmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
      setValue("vitals.bmi", calculatedBmi, { shouldValidate: true });
    }
  }, [weight, height, setValue]);

  const bmi = watch("vitals.bmi");

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Patient Vital Signs</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <div className="space-y-1.5">
          <Label htmlFor="bp" className="text-xs">Blood Pressure (mmHg)</Label>
          <Input
            id="bp"
            placeholder="120/80"
            disabled={isReadOnly}
            {...register("vitals.bloodPressure")}
          />
          {errors.vitals?.bloodPressure && (
            <p className="text-[11px] text-destructive">{errors.vitals.bloodPressure.message}</p>
          )}
        </div>

        {/* Temperature */}
        <div className="space-y-1.5">
          <Label htmlFor="temp" className="text-xs">Body Temperature (°C)</Label>
          <Input
            id="temp"
            type="number"
            step="0.1"
            placeholder="36.5"
            disabled={isReadOnly}
            {...register("vitals.temperature", { valueAsNumber: true })}
          />
          {errors.vitals?.temperature && (
            <p className="text-[11px] text-destructive">{errors.vitals.temperature.message}</p>
          )}
        </div>

        {/* Pulse Rate */}
        <div className="space-y-1.5">
          <Label htmlFor="hr" className="text-xs">Heart Rate (bpm)</Label>
          <Input
            id="hr"
            type="number"
            placeholder="72"
            disabled={isReadOnly}
            {...register("vitals.pulseRate", { valueAsNumber: true })}
          />
          {errors.vitals?.pulseRate && (
            <p className="text-[11px] text-destructive">{errors.vitals.pulseRate.message}</p>
          )}
        </div>

        {/* Respiratory Rate */}
        <div className="space-y-1.5">
          <Label htmlFor="rr" className="text-xs">Respiratory Rate (cpm)</Label>
          <Input
            id="rr"
            type="number"
            placeholder="16"
            disabled={isReadOnly}
            {...register("vitals.respiratoryRate", { valueAsNumber: true })}
          />
          {errors.vitals?.respiratoryRate && (
            <p className="text-[11px] text-destructive">{errors.vitals.respiratoryRate.message}</p>
          )}
        </div>

        {/* SpO2 */}
        <div className="space-y-1.5">
          <Label htmlFor="spo2" className="text-xs">Oxygen Saturation (SpO2 %)</Label>
          <Input
            id="spo2"
            type="number"
            placeholder="98"
            disabled={isReadOnly}
            {...register("vitals.oxygenSaturation", { valueAsNumber: true })}
          />
          {errors.vitals?.oxygenSaturation && (
            <p className="text-[11px] text-destructive">{errors.vitals.oxygenSaturation.message}</p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="65.0"
            disabled={isReadOnly}
            {...register("vitals.weight", { valueAsNumber: true })}
          />
          {errors.vitals?.weight && (
            <p className="text-[11px] text-destructive">{errors.vitals.weight.message}</p>
          )}
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <Label htmlFor="height" className="text-xs">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            step="0.5"
            placeholder="170"
            disabled={isReadOnly}
            {...register("vitals.height", { valueAsNumber: true })}
          />
          {errors.vitals?.height && (
            <p className="text-[11px] text-destructive">{errors.vitals.height.message}</p>
          )}
        </div>

        {/* Calculated BMI */}
        <div className="space-y-1.5">
          <Label htmlFor="bmi" className="text-xs">Calculated BMI</Label>
          <Input
            id="bmi"
            type="number"
            readOnly
            disabled
            value={bmi || ""}
            placeholder="Auto"
            className="bg-muted/40 font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
