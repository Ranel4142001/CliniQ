import { StyleSheet } from "@react-pdf/renderer";

export const reportPdfStyles = StyleSheet.create({
  reportHeader: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  reportMeta: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  table: {
    marginTop: 8,
    marginBottom: 16,
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
    fontSize: 8,
  },
  cell: {
    flex: 1,
    paddingRight: 4,
  },
  summaryText: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 8,
    textAlign: "right",
  },
});
