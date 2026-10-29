import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  rxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  rxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  rxMeta: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  section: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  patientGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridCol: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
  },
  val: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  symbolRx: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    color: "#2563eb",
    marginBottom: 8,
  },
  table: {
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 6,
    fontWeight: "bold",
    fontSize: 8,
    color: "#334155",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 6,
    fontSize: 9,
  },
  colMed: { flex: 3 },
  colSig: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  notesBox: {
    marginTop: 8,
    padding: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  notice: {
    marginTop: 24,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    fontSize: 8,
    color: "#64748b",
    textAlign: "center",
  },
});
