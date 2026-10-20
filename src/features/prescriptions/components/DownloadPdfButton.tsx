"use client";

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { PrescriptionPdf } from "./PrescriptionPdf";
import type { PrescriptionWithRelations } from "../types/prescription.types";

interface DownloadPdfButtonProps {
  prescription: PrescriptionWithRelations;
  variant?: "outline" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadPdfButton({
  prescription,
  variant = "outline",
  size = "sm",
  className = "",
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<PrescriptionPdf prescription={prescription} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Prescription-${prescription.prescriptionNo || "DRAFT"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-1.5" />
      )}
      Download PDF
    </Button>
  );
}
