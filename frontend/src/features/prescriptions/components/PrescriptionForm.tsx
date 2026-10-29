"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  createPrescriptionSchema,
  type CreatePrescriptionInput,
} from "@backend/contracts";
import { useCreatePrescription, useUpdatePrescription } from "@/features/prescriptions/hooks/use-prescriptions";
import { PrescriptionItemRow } from "@/features/prescriptions/components/PrescriptionItemRow";
import type { PrescriptionWithRelations } from "@backend/contracts";

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId?: string;
  patientName?: string;
  prescription?: PrescriptionWithRelations | null;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  consultationId,
  patientName,
  prescription,
}: PrescriptionFormProps) {
  const isEditing = Boolean(prescription);
  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription(prescription?.id || "");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePrescriptionInput>({
    resolver: zodResolver(createPrescriptionSchema),
    defaultValues: {
      consultationId: consultationId || "",
      notes: "",
      items: [{ medicineId: "", dosage: "", frequency: "Twice daily (every 12 hours)", durationDays: 7, quantity: 14, instructions: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  React.useEffect(() => {
    if (prescription) {
      reset({
        consultationId: prescription.consultationId,
        notes: prescription.notes || "",
        items: prescription.items.map((i) => ({
          medicineId: i.medicineId,
          dosage: i.dosage,
          frequency: i.frequency,
          durationDays: i.durationDays,
          quantity: i.quantity,
          instructions: i.instructions || "",
        })),
      });
    } else if (open) {
      reset({
        consultationId: consultationId || "",
        notes: "",
        items: [{ medicineId: "", dosage: "", frequency: "Twice daily (every 12 hours)", durationDays: 7, quantity: 14, instructions: "" }],
      });
    }
  }, [open, prescription, consultationId, reset]);

  const onSubmit = async (values: CreatePrescriptionInput) => {
    if (isEditing && prescription) {
      await updateMutation.mutateAsync({ notes: values.notes, items: values.items });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Prescription Draft" : "New Digital Prescription"}</DialogTitle>
          {patientName && <DialogDescription>Patient: {patientName}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Prescribed Medicines ({fields.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ medicineId: "", dosage: "", frequency: "Twice daily (every 12 hours)", durationDays: 7, quantity: 14, instructions: "" })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Medicine
              </Button>
            </div>

            {fields.map((field, idx) => (
              <PrescriptionItemRow
                key={field.id}
                index={idx}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onRemove={() => remove(idx)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Doctor&apos;s Instructions / Notes</Label>
            <Textarea id="notes" placeholder="e.g. Return after 1 week if symptoms persist..." {...register("notes")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save Draft Changes" : "Save as Draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
