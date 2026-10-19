"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useStockOut, useAdjustment } from "../hooks/use-medicines";
import type { MedicineWithStock } from "../types/medicine.types";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: MedicineWithStock | null;
  defaultType?: "STOCK_OUT" | "ADJUSTMENT";
}

export function StockMovementDialog({
  open,
  onOpenChange,
  medicine,
  defaultType = "STOCK_OUT",
}: StockMovementDialogProps) {
  const [movementType, setMovementType] = useState<"STOCK_OUT" | "ADJUSTMENT">(defaultType);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("auto");
  const stockOutMutation = useStockOut(medicine?.id || "");
  const adjustmentMutation = useAdjustment(medicine?.id || "");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ quantity: number; reason: string }>({
    defaultValues: { quantity: 1, reason: "" },
  });

  React.useEffect(() => {
    if (open) {
      setMovementType(defaultType);
      setSelectedBatchId("auto");
      reset({ quantity: 1, reason: "" });
    }
  }, [open, defaultType, reset]);

  if (!medicine) return null;
  const isPending = stockOutMutation.isPending || adjustmentMutation.isPending;

  const onSubmit = async (values: { quantity: number; reason: string }) => {
    const payload = {
      quantity: Number(values.quantity),
      reason: values.reason,
      batchId: selectedBatchId === "auto" ? undefined : selectedBatchId,
    };
    if (movementType === "STOCK_OUT") {
      await stockOutMutation.mutateAsync(payload);
    } else {
      await adjustmentMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{movementType === "STOCK_OUT" ? "Manual Stock Out" : "Inventory Adjustment"}</DialogTitle>
          <DialogDescription>
            {medicine.name} {medicine.strength} ({medicine.dosageForm}) • On hand: {medicine.totalStock} {medicine.unit}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Action Type</Label>
            <Select value={movementType} onValueChange={(val) => setMovementType(val as "STOCK_OUT" | "ADJUSTMENT")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK_OUT">Stock Out (Dispense / Removal)</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment (Damage / Recount / Spoilage)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Source Batch</Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto FEFO (Earliest Expiring First)</SelectItem>
                {medicine.batches.filter((b) => b.quantity > 0).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.batchNo} ({b.quantity} left, Exp: {new Date(b.expiryDate).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity to deduct ({medicine.unit}) *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={medicine.totalStock || undefined}
              {...register("quantity", { required: "Quantity is required", min: 1, valueAsNumber: true })}
            />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="reason">Reason {movementType === "ADJUSTMENT" ? "*" : "(Optional)"}</Label>
            <Textarea
              id="reason"
              placeholder={movementType === "ADJUSTMENT" ? "Required for adjustments..." : "Optional notes..."}
              {...register("reason", { required: movementType === "ADJUSTMENT" ? "Reason is required" : false })}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={isPending || medicine.totalStock <= 0}>
              {isPending ? "Processing..." : movementType === "STOCK_OUT" ? "Deduct Stock" : "Apply Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
