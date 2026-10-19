import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { PdfDocumentLayout } from "@/shared/components/pdf/PdfDocumentLayout";
import { pdfStyles as styles } from "./prescription-pdf.styles";
import type { PrescriptionWithRelations } from "../types/prescription.types";

interface PrescriptionPdfProps {
  prescription: PrescriptionWithRelations;
}

export function PrescriptionPdf({ prescription }: PrescriptionPdfProps) {
  const { patient, clinician, items, prescriptionNo, issuedAt, consultation } = prescription;

  return (
    <PdfDocumentLayout title="CliniQ Medical Center" subtitle="Medical Prescription & Digital Dispense Order">
      <View style={styles.rxHeader}>
        <View>
          <Text style={styles.rxTitle}>MEDICAL PRESCRIPTION</Text>
          <Text style={styles.rxMeta}>
            Rx Number: {prescriptionNo || "DRAFT"} • Status: {prescription.status}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.rxMeta}>
            Date: {issuedAt ? new Date(issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.rxMeta}>Prescribed by: Dr. {clinician?.fullName || "Attending Clinician"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.patientGrid}>
          <View style={styles.gridCol}>
            <Text style={styles.label}>Patient Name:</Text>
            <Text style={styles.val}>{patient?.firstName} {patient?.lastName}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.label}>Patient ID:</Text>
            <Text style={styles.val}>{patient?.patientNo}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.label}>Sex / Contact:</Text>
            <Text style={styles.val}>{patient?.sex || "N/A"} • {patient?.contactNumber || "N/A"}</Text>
          </View>
        </View>
      </View>

      {consultation?.diagnosis && (
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Clinical Diagnosis</Text>
          <Text style={{ fontSize: 9, color: "#1e293b" }}>{consultation.diagnosis}</Text>
        </View>
      )}

      <Text style={styles.symbolRx}>℞</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colMed}>Medication & Strength</Text>
          <Text style={styles.colSig}>Dosage & Frequency</Text>
          <Text style={styles.colQty}>Qty</Text>
        </View>

        {items.map((item, idx) => (
          <View key={item.id || idx} style={styles.tableRow}>
            <View style={styles.colMed}>
              <Text style={{ fontWeight: "bold" }}>
                {item.medicine.name} {item.medicine.strength}
              </Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>
                {item.medicine.dosageForm} {item.medicine.genericName ? `(${item.medicine.genericName})` : ""}
              </Text>
            </View>
            <View style={styles.colSig}>
              <Text>{item.dosage} • {item.frequency}</Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>
                Duration: {item.durationDays} days {item.instructions ? `• ${item.instructions}` : ""}
              </Text>
            </View>
            <Text style={styles.colQty}>
              {item.quantity} {item.medicine.unit}
            </Text>
          </View>
        ))}
      </View>

      {prescription.notes && (
        <View style={styles.notesBox}>
          <Text style={styles.sectionTitle}>Doctor&apos;s Notes / Instructions</Text>
          <Text style={{ fontSize: 9, color: "#1e3a8a" }}>{prescription.notes}</Text>
        </View>
      )}

      <View style={styles.notice}>
        <Text>NOTICE: SAMPLE FOR DEMONSTRATION ONLY. Contains no official professional license or physical signature.</Text>
      </View>
    </PdfDocumentLayout>
  );
}
