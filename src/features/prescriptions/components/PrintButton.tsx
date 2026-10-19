"use client";

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { PrescriptionPdf } from "./PrescriptionPdf";
import type { PrescriptionWithRelations } from "../types/prescription.types";

interface PrintButtonProps {
  prescription: PrescriptionWithRelations;
  variant?: "outline" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PrintButton({
  prescription,
  variant = "outline",
  size = "sm",
  className = "",
}: PrintButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setLoading(true);
      const blob = await pdf(<PrescriptionPdf prescription={prescription} />).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    } catch (err) {
      console.error("PDF print error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handlePrint}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <Printer className="h-4 w-4 mr-1.5" />
      )}
      Print
    </Button>
  );
}
