"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData> {
  columns: Array<ColumnDef<TData>>;
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowKey?: (row: TData, index: number) => string;
  expandedRowKey?: string | null;
  renderExpandedRow?: (row: TData) => ReactNode;
}

interface ColumnMeta {
  mobileHidden?: boolean;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Нет данных",
  getRowKey,
  expandedRowKey,
  renderExpandedRow,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-10 text-center">
        <Inbox className="mx-auto h-8 w-8 text-foreground-muted" />
        <p className="mt-3 text-sm text-foreground-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => {
                const meta = (header.column.columnDef.meta ?? {}) as ColumnMeta;

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground-muted",
                      meta.mobileHidden ? "hidden md:table-cell" : "",
                      meta.className,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
            const rowKey = getRowKey ? getRowKey(row.original, index) : row.id;
            const isExpanded =
              expandedRowKey !== undefined &&
              expandedRowKey !== null &&
              expandedRowKey === rowKey;

            return [
              <tr
                key={`${row.id}-main`}
                className="border-b border-border transition-colors hover:bg-white/[0.03]"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = (cell.column.columnDef.meta ?? {}) as ColumnMeta;

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3 align-middle",
                        meta.mobileHidden ? "hidden md:table-cell" : "",
                        meta.className,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>,
              isExpanded && renderExpandedRow ? (
                <tr
                  key={`${row.id}-expanded`}
                  className="border-b border-border bg-black/10 last:border-0"
                >
                  <td
                    className="px-4 py-3"
                    colSpan={row.getVisibleCells().length}
                  >
                    {renderExpandedRow(row.original)}
                  </td>
                </tr>
              ) : null,
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
