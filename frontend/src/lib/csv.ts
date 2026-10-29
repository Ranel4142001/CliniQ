export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, item: T) => string;
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename = "export.csv"
): void {
  if (typeof window === "undefined") return;

  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const rawValue = (item as Record<string, unknown>)[col.key as string];
        const formatted = col.formatter ? col.formatter(rawValue, item) : String(rawValue ?? "");
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
