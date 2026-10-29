"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { stockInSchema, type StockInInput } from "@backend/contracts";
import { useStockIn } from "@/features/medicines/hooks/use-medicines";
import type { MedicineWithStock } from "@backend/contracts";

interface BatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: MedicineWithStock | null;
}

export function BatchForm({ open, onOpenChange, medicine }: BatchFormProps) {
  const stockInMutation = useStockIn(medicine?.id || "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockInInput>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      batchNo: "",
      quantity: 1,
      expiryDate: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        batchNo: "",
        quantity: 1,
        expiryDate: "",
      });
    }
  }, [open, reset]);

  if (!medicine) return null;

  const onSubmit = async (values: StockInInput) => {
    await stockInMutation.mutateAsync(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Stock In (New / Existing Batch)</DialogTitle>
          <DialogDescription>
            {medicine.name} {medicine.strength} ({medicine.dosageForm})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="batchNo">Batch Number *</Label>
            <Input
              id="batchNo"
              placeholder="e.g. BATCH-2026-001"
              {...register("batchNo")}
            />
            {errors.batchNo && (
              <p className="text-xs text-destructive">{errors.batchNo.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity received ({medicine.unit}) *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              {...register("expiryDate")}
            />
            {errors.expiryDate && (
              <p className="text-xs text-destructive">{errors.expiryDate.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={stockInMutation.isPending}>
              {stockInMutation.isPending ? "Adding Stock..." : "Confirm Stock In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
