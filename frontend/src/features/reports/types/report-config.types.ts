import type { DataTableColumn } from "@/components/data-table/DataTable";
import type { CsvColumn } from "@/lib/csv";
import type { ReportKey } from "@backend/contracts";

export interface ReportConfig<T extends Record<string, unknown>> {
  key: ReportKey;
  title: string;
  description: string;
  supportsDateRange: boolean;
  columns: DataTableColumn<T>[];
  csvColumns: CsvColumn<T>[];
  pdfHeaders: string[];
  pdfRowMapper: (item: T) => string[];
}
