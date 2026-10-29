import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { PdfDocumentLayout } from "@/components/pdf/PdfDocumentLayout";
import { reportPdfStyles as styles } from "@/features/reports/components/report-pdf.styles";

interface ReportPdfDocumentProps {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
}

export function ReportPdfDocument({
  title,
  subtitle,
  headers,
  rows,
}: ReportPdfDocumentProps) {
  return (
    <PdfDocumentLayout title="CliniQ Medical Center" subtitle="Official Clinical & Management Report">
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.reportMeta}>
          {subtitle ? `${subtitle} • ` : ""}Generated: {new Date().toLocaleString()}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {headers.map((h, i) => (
            <Text key={i} style={styles.cell}>{h}</Text>
          ))}
        </View>

        {rows.map((row, rIdx) => (
          <View key={rIdx} style={styles.tableRow}>
            {row.map((val, cIdx) => (
              <Text key={cIdx} style={styles.cell}>{val || "—"}</Text>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.summaryText}>Total records in report: {rows.length}</Text>
    </PdfDocumentLayout>
  );
}
