"use client";

import React, { useState } from "react";
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
import { useVoidPrescription } from "@/features/prescriptions/hooks/use-prescriptions";

interface VoidPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionId: string;
  prescriptionNo?: string | null;
}

export function VoidPrescriptionDialog({
  open,
  onOpenChange,
  prescriptionId,
  prescriptionNo,
}: VoidPrescriptionDialogProps) {
  const [voidReason, setVoidReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const voidMutation = useVoidPrescription(prescriptionId);

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      setError("Please provide a reason for voiding this prescription.");
      return;
    }
    setError(null);
    await voidMutation.mutateAsync({ voidReason: voidReason.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Void Prescription</DialogTitle>
          <DialogDescription>
            Are you sure you want to void {prescriptionNo || "this draft prescription"}? This action cannot be reversed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <Label htmlFor="voidReason">Reason for Voiding *</Label>
          <Textarea
            id="voidReason"
            placeholder="e.g. Prescribed in error, patient changed treatment plan..."
            value={voidReason}
            onChange={(e) => { setVoidReason(e.target.value); setError(null); }}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleVoid} disabled={voidMutation.isPending}>
            {voidMutation.isPending ? "Voiding..." : "Confirm Void"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
