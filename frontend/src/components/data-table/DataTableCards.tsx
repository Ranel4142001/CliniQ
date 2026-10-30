import React, { ReactNode } from "react";
import type { DataTableColumn } from "@/components/data-table/DataTable";

const ACTIONS_HEADER = "actions";

function renderCell<T extends Record<string, unknown>>(
  col: DataTableColumn<T>,
  item: T
): ReactNode {
  if (col.cell) return col.cell(item);
  if (col.accessorKey) return String(item[col.accessorKey as string] ?? "-");
  return null;
}

function isActionsColumn<T>(col: DataTableColumn<T>): boolean {
  return typeof col.header === "string" && col.header.trim().toLowerCase() === ACTIONS_HEADER;
}

interface DataTableCardsProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (item: T) => void;
}

/**
 * Phone and tablet layout for DataTable: each row becomes a card instead of a cramped table row.
 * The first column is the card title, other columns are label/value pairs, and an
 * "Actions" column becomes a full-width footer so its buttons are easy to tap.
 */
export function DataTableCards<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
}: DataTableCardsProps<T>) {
  const [titleCol, ...rest] = columns;
  const fields = rest.filter((col) => !isActionsColumn(col));
  const actionsCol = rest.find(isActionsColumn);

  return (
    <ul className="divide-y divide-border/60">
      {data.map((item, rowIdx) => (
        <li
          key={rowIdx}
          onClick={() => onRowClick?.(item)}
          className={`space-y-3 p-4 ${onRowClick ? "cursor-pointer active:bg-muted/40" : ""}`}
        >
          {titleCol && (
            <div className="text-sm font-medium text-foreground">{renderCell(titleCol, item)}</div>
          )}

          {fields.length > 0 && (
            <dl className="grid grid-cols-[minmax(0,7rem)_1fr] gap-x-3 gap-y-2 text-sm">
              {fields.map((col, colIdx) => (
                <React.Fragment key={colIdx}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {col.header}
                  </dt>
                  <dd className="min-w-0 break-words text-foreground">{renderCell(col, item)}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}

          {actionsCol && (
            <div
              className="border-t border-border/60 pt-3 [&:not(:has(a,button))]:hidden [&_a]:min-h-10 [&_button]:min-h-10"
              onClick={(event) => event.stopPropagation()}
            >
              {renderCell(actionsCol, item)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
