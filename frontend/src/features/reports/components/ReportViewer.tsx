"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { exportToCsv } from "@/lib/csv";
import { Download, FileText, Loader2 } from "lucide-react";
import { useReport } from "@/features/reports/hooks/use-reports";
import { ReportPdfDocument } from "@/features/reports/components/ReportPdfDocument";
import type { ReportConfig } from "@/features/reports/types/report-config.types";

interface ReportViewerProps<T extends Record<string, unknown>> {
  config: ReportConfig<T>;
}

export function ReportViewer<T extends Record<string, unknown>>({ config }: ReportViewerProps<T>) {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  const { data = [], isLoading, error, refetch } = useReport<T>(config.key, { from, to, search });

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  React.useEffect(() => {
    setPage(1);
  }, [from, to, search, config.key]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) => String(val ?? "").toLowerCase().includes(q))
    );
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const handleExportCsv = () => {
    exportToCsv(filteredData, config.csvColumns, `${config.key}-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPdf = async () => {
    try {
      setIsPdfLoading(true);
      const { pdf } = await import("@react-pdf/renderer");
      const rows = filteredData.map((item) => config.pdfRowMapper(item));
      const blob = await pdf(
        <ReportPdfDocument
          title={config.title}
          subtitle={from && to ? `${from} to ${to}` : undefined}
          headers={config.pdfHeaders}
          rows={rows}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.key}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4 p-4 rounded-lg border bg-card text-card-foreground">
        {config.supportsDateRange ? (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <Label className="text-xs">From Date</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="flex items-center gap-1.5 pt-4">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                const d = new Date(); d.setDate(d.getDate() - 7);
                setFrom(d.toISOString().slice(0, 10)); setTo(new Date().toISOString().slice(0, 10));
              }}>Last 7d</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                const d = new Date(); d.setDate(d.getDate() - 30);
                setFrom(d.toISOString().slice(0, 10)); setTo(new Date().toISOString().slice(0, 10));
              }}>Last 30d</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setFrom(""); setTo(""); }}>Reset</Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">This report reflects real-time medicine inventory stock and statuses.</p>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCsv} disabled={filteredData.length === 0}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPdf} disabled={isPdfLoading || filteredData.length === 0}>
            {isPdfLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-1.5 h-3.5 w-3.5" />}
            Export PDF
          </Button>
        </div>
      </div>

      <DataTable
        data={paginatedData as unknown as Record<string, unknown>[]}
        columns={config.columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        isLoading={isLoading}
        error={error as Error}
        onRetry={refetch}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
        emptyTitle={`No records found`}
        emptyMessage={`No data matches the selected criteria for ${config.title}.`}
        pagination={{
          page,
          pageSize,
          total: filteredData.length,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
