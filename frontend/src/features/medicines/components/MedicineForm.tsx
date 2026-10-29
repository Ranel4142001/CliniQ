"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MEDICINE_CONFIG,
  type DosageForm,
  type MedicineUnit,
} from "@backend/contracts";
import {
  createMedicineSchema,
  type CreateMedicineInput,
} from "@backend/contracts";
import { useCreateMedicine, useUpdateMedicine } from "@/features/medicines/hooks/use-medicines";
import { MedicineFormFields } from "@/features/medicines/components/MedicineFormFields";
import type { MedicineWithStock } from "@backend/contracts";

interface MedicineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine?: MedicineWithStock | null;
}

export function MedicineForm({ open, onOpenChange, medicine }: MedicineFormProps) {
  const isEditing = Boolean(medicine);
  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine(medicine?.id || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateMedicineInput>({
    resolver: zodResolver(createMedicineSchema),
    defaultValues: {
      name: medicine?.name || "",
      genericName: medicine?.genericName || "",
      dosageForm: (medicine?.dosageForm as DosageForm) || "Tablet",
      strength: medicine?.strength || "",
      unit: (medicine?.unit as MedicineUnit) || "mg",
      reorderLevel: medicine?.reorderLevel ?? MEDICINE_CONFIG.DEFAULT_REORDER_LEVEL,
    },
  });

  React.useEffect(() => {
    if (medicine) {
      reset({
        name: medicine.name,
        genericName: medicine.genericName || "",
        dosageForm: medicine.dosageForm as DosageForm,
        strength: medicine.strength,
        unit: medicine.unit as MedicineUnit,
        reorderLevel: medicine.reorderLevel,
      });
    } else {
      reset({
        name: "",
        genericName: "",
        dosageForm: "Tablet",
        strength: "",
        unit: "mg",
        reorderLevel: MEDICINE_CONFIG.DEFAULT_REORDER_LEVEL,
      });
    }
  }, [medicine, reset]);

  const onSubmit = async (values: CreateMedicineInput) => {
    if (isEditing && medicine) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <MedicineFormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
